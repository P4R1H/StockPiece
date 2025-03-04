import os
import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context
import datetime
import re
import json
import sys


if not os.path.isfile(f"{os.path.realpath(os.path.dirname(__file__))}/../config.json"):
    sys.exit("'config.json' not found.")
else:
    with open(f"{os.path.realpath(os.path.dirname(__file__))}/../config.json") as file:
        config = json.load(file)

def check_owner(interaction: discord.Interaction) -> bool:
    return interaction.user.id in config["owner_command_users"] and interaction.guild.id == config["main_guild_id"] #checks if cmd is used in stockpiece server + is one of the owner accounts

class EmbedForm(discord.ui.Modal, title="Embed creation form"):
    
    titlex = discord.ui.TextInput(
        label="Title (Optional URL: Title||URL)",
        style=discord.TextStyle.short,
        placeholder="Title||https://example.com",
        required=False,
        max_length=256,
    )

    desc = discord.ui.TextInput(
        label="Embed description",
        style=discord.TextStyle.paragraph,
        placeholder="Desc here",
        required=False,
        max_length=4000,
    )

    media = discord.ui.TextInput(
        label="Image & Thumbnail URLs (separate by ||)",
        style=discord.TextStyle.short,
        placeholder="ImageURL || ThumbnailURL",
        required=False,
        max_length=1024,
    )

    footer_timestamp = discord.ui.TextInput(
        label="Footer,Timestamp(Footer||YYYY-MM-DD HH:MM:SS)",
        style=discord.TextStyle.short,
        placeholder="Footer text || 2025-03-03 12:34:56",
        required=False,
    )

    fields = discord.ui.TextInput(
        label="Fields (format: Name||Value||Inline)",
        style=discord.TextStyle.paragraph,
        placeholder="Separate fields by newlines (max 25); Example:\nField1||Value1||True\nField 2||something here||True",
        required=False,
        max_length=4000,
    )
    

    async def on_submit(self, interaction: discord.Interaction):
        self.interaction = interaction
        self.stop()


class RoleSearchModal(discord.ui.Modal,title="Search for roles:"):
    
    query = discord.ui.TextInput(
        label="Enter role name to search",
        placeholder="Type a role name...",
        style=discord.TextStyle.short,
        required=True,
        max_length=100,
    )

    async def on_submit(self, interaction: discord.Interaction):
        role_name = str(self.query).lower()

        matching_roles = []
        for role in interaction.guild.roles:
            if role.id == config["role_breakoff_id"]:
                break
            if role.name.lower().startswith(role_name) and role.hoist==False and role.is_assignable():
                matching_roles.append(role)

        if not matching_roles:
            self.stop()
            await interaction.response.send_message("No matching roles found.", ephemeral=True)
            return
        
        view = discord.ui.View()
        view.add_item(PostSearchSelect(self.query,matching_roles[0:25],interaction.user.roles))
        await interaction.response.send_message(
            "Found roles! Click the button below to proceed:",
            view=view,
            ephemeral=True,
        )
        


class PostSearchSelect(discord.ui.Select):
    def __init__(self,queryx: str,rolelist: list,userroles: list):
        super().__init__(placeholder=f"Role searched for: {queryx}",max_values=len(rolelist),min_values=0)
        self.queryx = queryx
        self.rolelist = rolelist
        
        for i in rolelist:
            self.add_option(
                label=i.name,
                value=i.id,
                default=True if i in userroles else False
            )

    async def callback(self, interaction: discord.Interaction):
        
        selected = []
        for id in self.values:
            role = interaction.guild.get_role(int(id)) 
            if role is None:
                role = next((r for r in interaction.guild.roles if r.id == int(id)), None)
            if role:
                selected.append(role)

        await interaction.user.add_roles(*selected)
        desel = [x for x in self.rolelist if x not in selected]
        await interaction.user.remove_roles(*desel)

        await interaction.response.send_message("Added/Removed roles!",ephemeral=True)




class RoleSearchButton(discord.ui.Button):
    def __init__(self):
        super().__init__(label="Search Roles",custom_id=config["custom_id_hardcode"])

    async def callback(self, interaction: discord.Interaction):
        await interaction.response.send_modal(RoleSearchModal())

class Owners(commands.Cog, name="Owner Commands"):
    def __init__(self, bot) -> None:
        self.bot = bot

    @app_commands.command(
        name="create_embed",
        description="Create an embed (Main stockpiece server admin-only).",
    )
    @app_commands.check(check_owner)
    @app_commands.guilds(discord.Object(id=config["main_guild_id"]))
    async def create_embed(self, interaction: discord.Interaction ,channel: discord.TextChannel, colorx: str="",add_role_button: bool=False) -> None:
        embed_form = EmbedForm()
        await interaction.response.send_modal(embed_form)
        await embed_form.wait()
        interaction = embed_form.interaction

        # Parse the color, default is lime green
        color = discord.Color.from_rgb(50, 205, 50)
        if colorx != "":
            try:
                color = discord.Color(int(colorx.strip("#"), 16))
            except ValueError:
                await interaction.response.send_message("Invalid color format. Use hex format like #7289DA.", ephemeral=True)
                return

        if not str(embed_form.titlex) and not str(embed_form.desc) and str(embed_form.titlex).split("||")[0] != "":
            await interaction.response.send_message("No title or description given!", ephemeral=True)
            return
        embed = discord.Embed(
            description=str(embed_form.desc) or None,
            color=color
        )

        regex = re.compile(
                r'^(?:http|ftp)s?://' # http:// or https://
                r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
                r'localhost|' #localhost...
                r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
                r'(?::\d+)?' # optional port
                r'(?:/?|[/?]\S+)$', re.IGNORECASE)

        title_parts = str(embed_form.titlex).split("||")
        embed.title = title_parts[0].strip() if title_parts[0] else None
        if len(title_parts) > 1:
            if re.match(regex, title_parts[1].strip()) is not None:
                embed.url = title_parts[1].strip()
            else:
                await interaction.response.send_message("Invalid Title Url!", ephemeral=True)
                return

        media_parts = str(embed_form.media).split("||")
        if len(media_parts) >= 1 and media_parts[0].strip():
            if re.match(regex, media_parts[0].strip()) is not None:
                embed.set_image(url=media_parts[0].strip())
            else:
                await interaction.response.send_message("Invalid Image Url!", ephemeral=True)
                return
            
        if len(media_parts) == 2 and media_parts[1].strip():
            if re.match(regex, media_parts[1].strip()) is not None:
                embed.set_thumbnail(url=media_parts[1].strip())
            else:
                await interaction.response.send_message("Invalid Thumbnail Url!", ephemeral=True)
                return

        footer_parts = str(embed_form.footer_timestamp).split("||")
        if len(footer_parts) >= 1 and footer_parts[0].strip():
            embed.set_footer(text=footer_parts[0].strip())

        if len(footer_parts) == 2:
            try:
                timestamp = datetime.datetime.strptime(footer_parts[1].strip(), "%Y-%m-%d %H:%M:%S")
                embed.timestamp = timestamp
            except ValueError:
                await interaction.response.send_message("Invalid timestamp format. Use **YYYY-MM-DD HH:MM:SS**.", ephemeral=True)
                return

        if str(embed_form.fields):
            field_lines = str(embed_form.fields).split("\n")
            if len(field_lines) > 25:
                await interaction.response.send_message("You can only have up to 25 fields.", ephemeral=True)
                return

            for line in field_lines:
                parts = line.split("||")
                if len(parts) < 2:
                    continue
                name = parts[0].strip()
                value = parts[1].strip()
                inline = parts[2].strip().lower() == "true" if len(parts) == 3 else False
                embed.add_field(name=name, value=value, inline=inline)
        if embed.description == None and embed.title == None:
            await interaction.response.send_message("No title or description given!", ephemeral=True)
            return
        if add_role_button:
            button = RoleSearchButton()
            view = discord.ui.View(timeout=None)
            view.add_item(button)
            await channel.send(embed=embed,view=view)
        else:
            await channel.send(embed=embed)

        await interaction.response.send_message("Embed created!", ephemeral=True)
        


async def setup(bot) -> None:
    await bot.add_cog(Owners(bot))
    button = RoleSearchButton()
    view = discord.ui.View(timeout=None)
    view.add_item(button)
    bot.add_view(view)