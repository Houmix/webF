# Generated by Django 5.2 on 2025-04-28 22:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("log", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="link",
            name="value",
            field=models.IntegerField(default=0),
        ),
    ]
