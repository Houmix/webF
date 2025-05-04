from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth import login, logout
from user.models import User, Profile
from forms import ContactForm
from django.core.mail import send_mail
from django.conf import settings
from .models import FAQ,News
from house.models import House

def house_view(request, house_id):
    house = House.objects.get(id=house_id)

    entities = house.entities.all()
    links = []
    for entity in entities:
        for link in entity.outgoing_links.all():
            links.append(link)
    print(entities)
    print(links)
    return render(request, 'house_graph.html', {
        'entities': entities,
        'links': links
    })

def Homepage(request):
    
    # Récupère les FAQ et les News pour tous les utilisateurs
    faq = FAQ.objects.all()
    news = News.objects.all().order_by("date")  # Tri croissant (du plus ancien au plus récent)
    
    if request.user.is_authenticated :
        accessible_houses = House.objects.filter(profile__user=request.user, profile__access=True)
        
        requested_houses = House.objects.filter(profile__user=request.user, profile__access=False)

        houses_with_profile = Profile.objects.filter(user=request.user).values_list('house_id', flat=True)
        not_requested_houses = House.objects.exclude(id__in=houses_with_profile)

        users = User.objects.exclude(id=request.user.id)
        context = {
            'accessible_houses': accessible_houses,
            'requested_houses': requested_houses,
            'not_requested_houses': not_requested_houses,
            'users': users,
            'faq': faq,
            'news': news
        }
    
    else :
        
        context = {
            'faq': faq,
            'news': news
        }

    
    return render(request, 'home/homepage.html', context)

def contact(request):
    form = ContactForm()
    if (len(request.POST)>0):
        form=ContactForm(request.POST)
        if form.is_valid():
            name=request.POST['name']
            email=request.POST['email']
            object=request.POST['objet']
            message=request.POST['message']
            send_mail(object,"De "+email+ "\n"+ message,settings.EMAIL_HOST_USER, recipient_list=[settings.EMAIL_HOST_USER],fail_silently=False)
            send_mail(object,"Hey,\nOn a bien reçu ton mail, on te répond d'ici 24H.\nMerci !",settings.EMAIL_HOST_USER, recipient_list=[email],fail_silently=False)
            form = ContactForm()
            return render(request, "home/contact.html", {'form':form , 'name':name})
        else :
            return render(request, "home/contact.html", {'form':form})
    
    else :  
        return render(request, "home/contact.html", {'form':form} )