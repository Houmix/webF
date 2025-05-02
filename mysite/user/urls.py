from django.urls import path, include
from user.views import login, signUp,public_profile, myspace, modify_profil, logout, activate_account, forgot_password, reset_password,change_password,request_access,dashboard_view

urlpatterns = [
    path('login/', login, name="Login"),
    path('signUp/', signUp, name="SignUp"),
    path('public_profil/<int:user_id>/', public_profile, name="PublicSpace"),
    path('request_access/<int:house_id>/', request_access, name="RequestAccess"),
    path('myspace/', myspace, name="MySpace"),
    path('change_password/', change_password, name='ChangePassword'),
    path('modify_profil/', modify_profil, name='ModifyProfil'),
    path('logout/', logout, name='Logout'),
    path('activate_account/<str:token>/', activate_account, name= 'Activate_Account'),
    path("forgot_passord/", forgot_password, name = "Forgot_Password"),
    path('reset-password/<str:token>/', reset_password, name='Reset_Password'),
    path('dashboard/', dashboard_view, name='Dashboard'),
]