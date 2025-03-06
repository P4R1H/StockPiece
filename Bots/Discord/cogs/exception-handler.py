import discord
from discord.ext import commands

class ExceptionHandler(commands.Cog, name="ErrorHandler"):
    def __init__(self, bot) -> None:
        self.bot = bot
        self.logger = bot.logger
        bot.tree.error(coro = self.__dispatch_to_app_command_handler)

    async def __dispatch_to_app_command_handler(self, interaction: discord.Interaction, error: discord.app_commands.AppCommandError):
        self.bot.dispatch("app_command_error", interaction, error)

    @commands.Cog.listener("on_app_command_error")        
    async def get_app_command_error(self, interaction: discord.Interaction, error: discord.app_commands.AppCommandError):
        # Handling app command check failures
        if isinstance(error, discord.app_commands.CheckFailure):
            embed = discord.Embed(
                title="Error!",
                description="You do not have permission to execute this command. Make sure you're authorized to run this command.",
                color=0xE02B2B
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
            self.logger.debug(f"{interaction.user} (ID: {interaction.user.id}) attempted to run an app command they do not have permission for in the guild {interaction.guild.name} (ID: {interaction.guild.id}).")
        # Handle other types of errors here (e.g., MissingPermissions, BotMissingPermissions)
        elif isinstance(error, commands.CommandOnCooldown):
            minutes, seconds = divmod(error.retry_after, 60)
            hours, minutes = divmod(minutes, 60)
            hours = hours % 24
            self.logger.debug(f"{interaction.user} (ID: {interaction.user.id})  {interaction.guild.name} (ID: {interaction.guild.id}). Error: {error}")
            embed = discord.Embed(
                title="Error!",
                description=f"**Please slow down** - You can use this command again in {f'{round(hours)} hours' if round(hours) > 0 else ''} {f'{round(minutes)} minutes' if round(minutes) > 0 else ''} {f'{round(seconds)} seconds' if round(seconds) > 0 else ''}.",
                color=0xE02B2B,
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
        elif isinstance(error, commands.MissingPermissions):
            self.logger.debug(f"{interaction.user} (ID: {interaction.user.id})  {interaction.guild.name} (ID: {interaction.guild.id}). Error: {error}")
            embed = discord.Embed(
                title="Error!",
                description="You are missing the permission(s) `"
                + ", ".join(error.missing_permissions)
                + "` to execute this command!",
                color=0xE02B2B,
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
        elif isinstance(error, commands.BotMissingPermissions):
            self.logger.debug(f"{interaction.user} (ID: {interaction.user.id})  {interaction.guild.name} (ID: {interaction.guild.id}). Error: {error}")
            embed = discord.Embed(
                title="Error!",
                description="I am missing the permission(s) `"
                + ", ".join(error.missing_permissions)
                + "` to fully perform this command!",
                color=0xE02B2B,
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
        elif isinstance(error, commands.MissingRequiredArgument):
            self.logger.debug(f"{interaction.user} (ID: {interaction.user.id})  {interaction.guild.name} (ID: {interaction.guild.id}). Error: {error}")
            embed = discord.Embed(
                title="Error!",
                description=str(error),
                color=0xE02B2B,
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
        elif isinstance(error, discord.app_commands.TransformerError):
            self.logger.debug(f"{interaction.user} (ID: {interaction.user.id})  {interaction.guild.name} (ID: {interaction.guild.id}). Error: {error}")
            embed = discord.Embed(
                title="Error!",
                description="An unexpected error occurred. An Invalid input may have been provided.",
                color=0xE02B2B,
            )
            await interaction.response.send_message(embed=embed, ephemeral=True)
        else:
            raise error
        
async def setup(bot: commands.Bot) -> None:
    await bot.add_cog(ExceptionHandler(bot))