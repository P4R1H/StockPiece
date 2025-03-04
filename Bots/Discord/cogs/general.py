import discord
from discord import app_commands
from discord.ext import commands
from discord.ext.commands import Context


class General(commands.Cog, name="general"):
    def __init__(self, bot) -> None:
        self.bot = bot
        
    @commands.hybrid_command(
        name="help", description="List all commands the bot has loaded."
    )
    async def help(self, context: Context) -> None:
        prefix = self.bot.prefix
        embed = discord.Embed(
            title="Help", description="List of available commands:", color=0xBEBEFE
        )
        for i in self.bot.cogs:
            if i == "owners":
                continue
            cog = self.bot.get_cog(i.lower())
            if cog:
                commands = cog.get_commands()
                data = []
                for command in commands:
                    description = command.description.partition("\n")[0]
                    data.append(f"{prefix}{command.name} - {description}")
                help_text = "\n".join(data)
                embed.add_field(
                    name=i.capitalize(), value=f"```{help_text}```", inline=False
                )
        embed.set_footer(text=self.bot.config["website_link"])
        await context.send(embed=embed)


    @commands.hybrid_command(
        name="ping",
        description="Check if the bot is alive.",
    )
    @commands.is_owner()
    async def ping(self, context: Context) -> None:
        embed = discord.Embed(
            title="Latency check",
            description=f"The bot latency is {round(self.bot.latency * 1000)}ms.",
            color=0xBEBEFE,
        )
        await context.send(embed=embed)

    @commands.hybrid_command(
        name="invite",
        description="Get the invite link of the bot to be able to invite it.",
    )
    async def invite(self, context: Context) -> None:

        embed = discord.Embed(
            description=f"Invite me by clicking [here]({self.bot.config["inv_link"]}).",
            color=0xD75BF4,
        )
        embed.set_footer(text=self.bot.config["website_link"])
        await context.send(embed=embed)

    @commands.hybrid_command(
        name="server",
        description="Get the invite link of the discord server of the bot for support, or to provide feedback.",
    )
    async def server(self, context: Context) -> None:

        embed = discord.Embed(
            description=f"Join the support server for the bot by clicking [here]({self.bot.config["server_link"]}).",
            color=0xD75BF4,
        )
        embed.set_footer(text=self.bot.config["website_link"])
        await context.send(embed=embed)


async def setup(bot) -> None:
    await bot.add_cog(General(bot))