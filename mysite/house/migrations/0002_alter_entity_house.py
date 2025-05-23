# Generated by Django 5.2 on 2025-04-25 18:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("house", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="entity",
            name="house",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="entities",
                to="house.house",
            ),
        ),
    ]
