from django import forms
from user.models import User
from django.core.mail import send_mail
from django.contrib.auth.hashers import check_password
from django.utils.crypto import get_random_string
from django.urls import reverse
from django.conf import settings
from django.core.validators import RegexValidator
from django.contrib.auth.hashers import check_password


class LoginForm(forms.Form):
    email = forms.EmailField(label='E-mail')
    password = forms.CharField(label='Mot de passe', widget=forms.PasswordInput)

    def clean(self):
        cleaned_data = super(LoginForm, self).clean()
        email = cleaned_data.get('email')
        email = email.lower()
        password = cleaned_data.get('password')
        print(password)
        print(email)
        if email and password:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                raise forms.ValidationError("Adresse email ou mot de passe incorrect")

            if not check_password(password, user.password):
                raise forms.ValidationError("Adresse email ou mot de passe incorrect")

            if not user.is_active:
                raise forms.ValidationError("Activez votre compte")

        return cleaned_data
class SignUpForm(forms.ModelForm):
    SEXE_CHOICES = [
    ('Homme', 'Homme'),
    ('Femme', 'Femme'),
    ('Autre', 'Autre'),
    ]
    photo = forms.ImageField(required=False,widget=forms.FileInput(attrs={'class': 'custom-placeholder'}))
    first_name = forms.CharField(max_length=128,widget=forms.TextInput(attrs={'placeholder': 'Prénom','class': 'custom-placeholder'}))
    last_name = forms.CharField(max_length=128,widget=forms.TextInput(attrs={'placeholder': 'Nom','class': 'custom-placeholder'}))
    sexe = forms.ChoiceField(choices=SEXE_CHOICES,widget=forms.Select(attrs={'class': 'custom-placeholder'}))
    birth_date = forms.DateField(widget=forms.DateInput(attrs={'placeholder': 'Date de naissance','class': 'custom-placeholder','type': 'date'}))
    email = forms.CharField(max_length=128,widget=forms.TextInput(attrs={'placeholder': 'Adresse email','class': 'custom-placeholder'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Mot de passe','class': 'custom-placeholder'}))
    username = forms.CharField(max_length=128,widget=forms.TextInput(attrs={'placeholder': 'Pseudo','class': 'custom-placeholder'}))

    class Meta :
        model = User
        exclude = ('is_staff', 'is_active','date_joined','groups','user_permissions','is_superuser','last_login')
        fields = ['photo', "last_name","first_name",'sexe','birth_date','email','password','username']#Give the order that will be displayed in the register form
        labels = {
            'photo':'Photo de profil',
            'first_name': 'Prénom',
            'last_name': 'Nom',
            'sexe':'Sexe',
            'birth_date':'Date de naissance',
            'email' : "E-mail",
            "password" : "Mot de passe",
            "username" : 'Pseudo',
        }#Change the name of the labels


    def clean(self):
        cleaned_data=super (SignUpForm, self).clean()
        email=cleaned_data.get('email')
        email = email.lower()
        result = User.objects.filter(email=email)
        if len(result)==1:
            raise forms.ValidationError("Adresse e-mail déja reliée à un compte existant")
        return cleaned_data
    def save(self, commit=True):
        user = super().save(commit=False)#Commit = False don't let django save this user in the DB as an active account. is_active=0
        user.set_password(self.cleaned_data['password'])#Hash the password
        user.token = get_random_string(length=32)  # Generate a unique token
        user.is_active = True#activate his account
        user.save()
        send_account_creation_mail(user)
        return user
        if commit:
            user.save()
            send_activation_email(user)
        return user
def send_account_creation_mail(user):
    subject = 'Compte crée'
    message = "Votre compte a été crée avec succès.\nL'équipe de ConnectedSystem"
    send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])
def send_activation_email(user):
    activation_link = reverse('Activate_Account', args=[user.token])
    activation_url = f'{settings.BASE_URL}{activation_link}'
    subject = 'Activez votre compte'
    message = f'Hey !\nRavi de vous compter parmis nous.\nCliquez sur le lien ci-dessous pour activer votre compte:\n{activation_url}'
    send_mail(subject, message, settings.EMAIL_HOST_USER, [user.email])



class ContactForm(forms.Form):
    name = forms.CharField(label='Nom',max_length=50)
    email = forms.EmailField(label='E-mail')
    objet = forms.ChoiceField(choices=(("Remise en main propre","Remise en main propre"),("Question sur un produit","Question sur un produit"),("Suggestion","Suggestion"),("Support technique","Support technique"),("Aide relative à une commande","Aide relative à une commande"),('Modifier/Annuler une commande','Modifier/Annuler une commande'),("Autres","Autres")),widget=forms.Select)
    message = forms.CharField(label='Message', widget=forms.Textarea)
    
class ModifyProfil(forms.ModelForm):
    class Meta :
        model = User
        exclude = ('username', 'is_staff', 'is_active','date_joined','groups','user_permissions','is_superuser','last_login', "password", "email")
        fields = ["first_name", "last_name","sexe"]#Give the order that will be displayed in the register form
        labels = {
            'first_name': 'Prenom',
            'last_name': 'Nom',
            "sexe" : 'Sexe',
        }


class PasswordChangeForm(forms.Form):
    old_password = forms.CharField(
        label="Ancien mot de passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    new_password = forms.CharField(
        label="Nouveau mot de passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )
    confirm_password = forms.CharField(
        label="Confirmer le nouveau mot de passe",
        widget=forms.PasswordInput(attrs={'class': 'form-control'})
    )

    def clean(self):
        cleaned_data = super().clean()
        new_password = cleaned_data.get('new_password')
        confirm_password = cleaned_data.get('confirm_password')

        if new_password != confirm_password:
            raise forms.ValidationError("Les mots de passe ne correspondent pas.")
        return cleaned_data