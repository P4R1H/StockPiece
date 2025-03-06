import os
import json
import sys
import discord


if not os.path.isfile(f"{os.path.realpath(os.path.dirname(__file__))}/config.json"):
    sys.exit("'config.json' not found.")
else:
    with open(f"{os.path.realpath(os.path.dirname(__file__))}/config.json") as file:
        config = json.load(file)

def check_owner(interaction: discord.Interaction) -> bool:
    return interaction.user.id in config["owner_command_users"] and not interaction.guild is None and interaction.guild.id == config["main_guild_id"] #checks if cmd is used in stockpiece server + is one of the owner accounts

def check_admin(interaction: discord.Interaction) -> bool:
    #change to check admin role
    uroles = [str(role.id) for role in interaction.user.roles]
    return str(config["admin_role_id"]) in uroles and not interaction.guild is None and interaction.guild.id == config["main_guild_id"] #checks if cmd is used in stockpiece server + is used by an admin

def check_guild(interaction: discord.Interaction) -> bool:
    return not interaction.guild is None and interaction.guild.id == config["main_guild_id"] #checks if cmd is used in stockpiece server

def get_config(x):
    return config[x]

