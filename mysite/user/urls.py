from django.urls import path, include
from user.views import login, signUp,public_profile, myspace, modify_profil, logout, activate_account, forgot_password, reset_password,change_password,request_access,dashboard_view,accept_access,generate_entity_pdf,generate_global_pdf,suppression,respond_incident,suppressionEntity,create_incident,respond_to_incident

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
    path('accept-access/<int:house_id>/<int:user_id>/', accept_access, name='AcceptAccess'),
    path('generate_pdf/entity/<int:entity_id>/', generate_entity_pdf, name='generate_entity_pdf'),
    path('generate_pdf/global_report/<int:house_id>/', generate_global_pdf, name='generate_global_pdf'),
    path('request_suppresion/<int:request_id>/<int:choice>/', suppression, name='RequestSuppression'),
    path('incident/<int:incident_id>/respond/', respond_incident, name='RespondIncident'),
    path('request_suppresion_entity/<int:request_id>/<int:choice>/', suppressionEntity, name='RequestSuppressionObject'),
    path('incidents/create/<int:entity_id>', create_incident, name='CreateIncident'),
    path('incident/answer/<int:incident_id>/', respond_to_incident, name='AnswerIncident'),



]