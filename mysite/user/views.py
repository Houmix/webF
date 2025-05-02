
from django.contrib import messages
from django.contrib.auth.hashers import check_password
from django.shortcuts import render, redirect
from django.contrib.auth import logout as auth_logout, login as auth_login
from forms import LoginForm, SignUpForm, ModifyProfil
from user.models import User
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_protect
from django.utils.crypto import get_random_string
from django.urls import reverse
from django.conf import settings
from django.contrib.auth.forms import SetPasswordForm
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.contrib.auth.decorators import login_required
from django.core.exceptions import MultipleObjectsReturned
from django.contrib.auth import update_session_auth_hash
from forms import PasswordChangeForm
from house.models import House,Entity
from user.models import Profile
from log.models import FluxStat

def login(request):
    form = LoginForm()
    #next_url = request.POST.get('next', '/home')
    if (len(request.POST)>0):
        
        form=LoginForm(request.POST)
        if form.is_valid():
            user_email = form.cleaned_data['email']
            user_email = user_email.lower()
            logged_user = User.objects.get(email=user_email)
            auth_login(request, logged_user)
            
            return redirect('Home')
        else : 
            return render(request, "user/login.html", {'form':form})
    else :
        return render(request, 'user/login.html', {'form':form})
def logout(request):
    auth_logout(request)
    return redirect("Home")


def signUp(request):
    if request.method == "POST":
        form = SignUpForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('Login')
    else:
        form = SignUpForm()
    
    return render(request, 'user/signUp.html', {'form': form})
def activate_account(request, token):
    try:
        one_user = User.objects.get(token=token)#Looking for user with that token
        if one_user.is_active:
            return render(request, 'user/already_activate.html')
        else:
            one_user.is_active = True#activate his account
            one_user.token = 'Active'#delet the token
            one_user.save()#save changement
            return render(request, 'user/activate.html')
    except User.DoesNotExist:
        return render(request, 'user/activation_error.html')
    except MultipleObjectsReturned:
        return render(request, 'user/activation_error.html')
    
@csrf_protect
def forgot_password(request):
    
    if request.method == 'POST':
        email = request.POST.get('email')
        email = email.lower()
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return render(request, 'user/forgot_password.html', {'email':email})
        else:
            token = get_random_string(length=32)#generate a new token and save to use it for the reset
            user.token = token
            user.save()
            reset_link = reverse('Reset_Password', args=[token])#call that page with that token
            reset_url = f'{settings.BASE_URL}{reset_link}'
            subject = 'Mot de passe oublié ?'
            message = f'Ce lien vous permet de reinitialiser votre mot de passe:\n{reset_url}'
            send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])#send mail with the unique link to reset the password
            return render(request, 'user/forgot_password.html', {'email':email})
    return render(request, 'user/forgot_password.html')


def reset_password(request, token):
    User = get_user_model()
    user = get_object_or_404(User, token=token)#Looking for that unique user with that token
    if request.method == 'POST':#if the form is valid
        form = SetPasswordForm(user=user, data=request.POST)
        if form.is_valid():
            form.save()
            user.token = ''
            user.save()
            return redirect(reverse('Home'))
    else:
        form = SetPasswordForm(user=user)
    return render(request, 'user/reset_password.html', {'form': form})


def public_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)

    context = {
        'username': user.username,
        'sexe': user.sexe,
        'birth_date': user.birth_date,
        'photo_url': user.photo if user.photo else None,
    }
    return render(request, 'space/public_profile.html', context)



@login_required(login_url='Login')
def myspace(request):
    user = request.user

    context = {
        'username': user.username,
        'sexe': user.sexe,
        'birth_date': user.birth_date,
        'photo_url': user.photo.url if user.photo else None,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
    }
    return render(request, 'space/myspace.html', context)



@login_required(login_url='Login')
def change_password(request):
    if request.method == "POST":
        form = PasswordChangeForm(request.POST)
        if form.is_valid():
            user = request.user
            if not user.check_password(form.cleaned_data['old_password']):
                form.add_error('old_password', 'Ancien mot de passe incorrect.')
            else:
                user.set_password(form.cleaned_data['new_password'])
                user.save()
                update_session_auth_hash(request, user)  # Important pour ne pas déconnecter l'utilisateur
                messages.success(request, "Votre mot de passe a été mis à jour avec succès.")
                return redirect('MySpace')  # Redirige où tu veux après succès
    else:
        form = PasswordChangeForm()
    return render(request, 'user/change_password.html', {'form': form})




def request_access(request, house_id):
    house = get_object_or_404(House, id=house_id)

    # Vérifie si un profil existe déjà pour cette maison
    profile_exists = Profile.objects.filter(user=request.user, house=house).exists()
    
    if profile_exists:
        messages.warning(request, "Vous avez déjà fait une demande ou avez déjà accès à cette maison.")
    else:
        Profile.objects.create(
            user=request.user,
            house=house,
            access=False,
            isOwner=False,
            role='simple'
        )
        messages.success(request, "Demande d'accès envoyée avec succès.")

    return redirect('Home') 



@login_required
def dashboard_view(request):
    user = request.user
    houses = House.objects.all()

    selected_house_id = request.GET.get('house_id')
    selected_house = House.objects.filter(id=selected_house_id).first() if selected_house_id else None
    profile = Profile.objects.filter(user=user, house=selected_house).first() if selected_house else None

    entities = Entity.objects.filter(house=selected_house) if profile and profile.access else []
    flux_stats = FluxStat.objects.filter(entity__house=selected_house) if profile and profile.access else []

    flux_summary = {}
    for stat in flux_stats:
        flux_summary.setdefault(stat.flux_type, []).append(stat.value)

    return render(request, 'dashboard/dashboard.html', {
        'houses': houses,
        'selected_house': selected_house,
        'profile': profile,
        'entities': entities,
        'flux_summary': flux_summary,
    })


#####################Non utilisé
@login_required(login_url='Login')
def modify_profil(request):
    if len(request.POST)>0:
        
        form = ModifyProfil(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            return redirect('UserSpace')
        else : 
            return render(request, 'user/modify_profil.html', {"form":form})
    else :
        form = ModifyProfil(instance=request.user)
        return render(request, 'user/modify_profil.html', {"form":form})














