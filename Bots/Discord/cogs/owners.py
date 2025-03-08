import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context
import datetime
import re
from shared_functions import check_admin,check_guild,get_config




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


class RoleTransformer(app_commands.Transformer):
    def __init__(self):
        self.breakoff_role_id = get_config("role_breakoff_id")
    
    async def transform(self, interaction: discord.Interaction, role_id: str) -> discord.Role:
        role = discord.utils.get(interaction.guild.roles, id=int(role_id))
        breakoff_role = discord.utils.get(interaction.guild.roles, id=self.breakoff_role_id)
        
        if not role or not breakoff_role:
            raise app_commands.TransformerError("Invalid role.")
        
        if (role.position >= breakoff_role.position or role.hoist or not role.is_assignable()):
            raise app_commands.TransformerError("You cannot assign this role.")
        
        return role
    
    async def autocomplete(self, interaction, current: str):
        breakoff_role = discord.utils.get(interaction.guild.roles, id=self.breakoff_role_id)
        
        if not breakoff_role:
            return []
        
        filtered_roles = [
            role for role in interaction.guild.roles
            if role.position < breakoff_role.position
            and not role.hoist
            and role.is_assignable()
            and current.strip('@').lower() in role.name.lower() 
            and (role.permissions.value & discord.Permissions.elevated().value)==0
        ]
        
        return [app_commands.Choice(name='@'+role.name, value=str(role.id)) for role in filtered_roles[:25]]



class Owners(commands.Cog, name="Owner Commands"):
    def __init__(self, bot) -> None:
        self.bot = bot

    @app_commands.command(
        name="create_embed",
        description="Create an embed (Main stockpiece server admin-only).",
    )
    @app_commands.check(check_admin)
    @app_commands.guilds(discord.Object(id=get_config("main_guild_id")))
    async def create_embed(self, interaction: discord.Interaction ,channel: discord.TextChannel, colorx: str="") -> None:
        embed_form = EmbedForm()
        await interaction.response.send_modal(embed_form)
        await embed_form.wait()
        interaction = embed_form.interaction

        # Parse the color, default is lime green
        color = discord.Color(int("EFBF04", 16))
        if colorx != "":
            try:
                color = discord.Color(int(colorx.strip("#"), 16))
            except ValueError:
                await interaction.response.send_message("Invalid color format. Use hex format like #7289DA.", ephemeral=True)
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
        if embed.description == None and embed.title == None and embed.image == None:
            await interaction.response.send_message("No title, description or image given!", ephemeral=True)
            return
        m = await channel.send(embed=embed)
        print(m.id)
        self.bot.cembed_id.append(m.id)
        await interaction.response.send_message("Embed created!", ephemeral=True)
        
    @app_commands.command(
        name="role",
        description="Add/Remove role.",
    )
    @app_commands.check(check_guild)
    @app_commands.guilds(discord.Object(id=get_config("main_guild_id")))
    @app_commands.describe(role="Role you want to add/remove")
    async def role(self, interaction: discord.Interaction,role: app_commands.Transform[discord.Role, RoleTransformer()]):
        if not role:
            await interaction.response.send_message("No matching roles found.", ephemeral=True)
            return
        breakoff_role = discord.utils.get(interaction.guild.roles, id=get_config("role_breakoff_id"))
        if role.position < breakoff_role.position and not role.hoist and role.is_assignable() and (role.permissions.value & discord.Permissions.elevated().value) !=0:
            await interaction.response.send_message(f"Not allowed to add this role!",ephemeral=True)
            return
        elif role in interaction.user.roles:
            await interaction.user.remove_roles(role)
            await interaction.response.send_message(f"Removing role {role.name}.",ephemeral=True)
        else:
            await interaction.user.add_roles(role)
            await interaction.response.send_message(f"Adding role {role.name}.",ephemeral=True)
        
async def setup(bot) -> None:
    await bot.add_cog(Owners(bot))
