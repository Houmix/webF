# Generated by Django 5.2 on 2025-05-01 15:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("log", "0002_link_value"),
    ]

    operations = [
        migrations.AlterField(
            model_name="fluxstat",
            name="flux_type",
            field=models.CharField(
                choices=[
                    ("electricity", "Électricité"),
                    ("water", "Eau"),
                    ("internet", "Internet"),
                ],
                max_length=50,
            ),
        ),
        migrations.AlterField(
            model_name="link",
            name="type",
            field=models.CharField(
                choices=[
                    ("electricity", "Électricité"),
                    ("water", "Eau"),
                    ("internet", "Internet"),
                ],
                max_length=50,
            ),
        ),
    ]
