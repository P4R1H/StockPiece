

import math

def calculate_price_update(current_price, prev_circulation, bought_this_chap, sold_this_chap):
    # Handle zero trading volume
    total_volume = bought_this_chap + sold_this_chap
    if total_volume == 0:
        return current_price
    
    # Prevent division by zero in volume impact calculation
    effective_circulation = max(prev_circulation, 1)
    
    # Calculate buy pressure (-1 to +1)
    buy_pressure = (bought_this_chap - sold_this_chap) / total_volume
    
    # Calculate volume impact with circulation safeguard
    volume_ratio = total_volume / effective_circulation
    volume_impact = math.log(1 + volume_ratio) * 2
    
    # Price stability for expensive stocks
    price_dampener = 1 / (1 + math.log(1 + current_price / 100))
    
    # Calculate raw percentage change
    percent_change = buy_pressure * volume_impact * price_dampener * 100
    
    # Dynamic maximum change based on price
    max_change_percent = 300 / (1 + math.log(1 + current_price / 50))
    percent_change = max(min(percent_change, max_change_percent), -max_change_percent)
    
    # Calculate new price with anti-crash protection
    new_price = current_price * (1 + percent_change / 100)
    return max(new_price, 0.01)  # Never below 1 cent

def gpt_calculate_price_update(current_price, prev_circulation, bought_this_chap, sold_this_chap):
    total_volume = bought_this_chap + sold_this_chap
    if total_volume == 0:
        return current_price

    # If circulation is zero, use a tiny epsilon (instead of defaulting to 1)
    epsilon = 1e-6
    effective_circulation = prev_circulation if prev_circulation > 0 else epsilon

    # Calculate buy pressure: positive means buying pressure, negative means selling
    buy_pressure = (bought_this_chap - sold_this_chap) / total_volume

    # Using the actual circulating supply makes volume_ratio more sensitive when supply is low.
    volume_ratio = total_volume / effective_circulation
    volume_impact = math.log(1 + volume_ratio) * 2

    # --- Damping factor based on total stocks in the market (circulation) ---
    if prev_circulation > 0:
        price_dampener = 1 / (1 + math.log(1 + prev_circulation/100))
    else:
        price_dampener = 1  # in an illiquid market, apply full effect
    # Price dampener reduces impact for higher-priced stocks.
    # price_dampener = 1 / (1 + math.log(1 + current_price / 100))

    # Raw percent change based on trading pressure and liquidity.
    percent_change = buy_pressure * volume_impact * price_dampener * 100

    # Clamp the percentage change to a dynamic maximum.
    max_change_percent = 300 / (1 + math.log(1 + current_price / 50))
    percent_change = max(min(percent_change, max_change_percent), -max_change_percent)

    # Calculate base new price from percent change.
    new_price = current_price * (1 + percent_change / 100)

    # --- New Section: Incorporate circulation change ---
    # For instance, if selling removes shares from circulation, compute the new circulating supply.
    # (Assuming: shares bought are added back, shares sold are removed.)
    new_circulation = prev_circulation + bought_this_chap - sold_this_chap
    # If circulation is dropping, this factor will be <1, reducing the price further.
    # If circulation is rising, the factor will be >1.
    # (Make sure prev_circulation isn’t zero; we already handled that above.)
    circulation_factor = new_circulation / effective_circulation

    # Adjust new price based on how circulation has changed.
    new_price *= circulation_factor
    # --- End New Section ---

    # Ensure the new price never falls below 1 cent.
    return max(new_price, 0.01)


class Stock:
    def __init__(self, name, price, circulation):
        self.name = name
        self.price = price
        self.circulation = circulation
        self.bought_this_chap = 0
        self.sold_this_chap = 0

    def update_price(self):
        old_price = self.price
        self.price = gpt_calculate_price_update(
            self.price,
            self.circulation,
            self.bought_this_chap,
            self.sold_this_chap
        )
        self.circulation += self.bought_this_chap - self.sold_this_chap
        percent_change = ((self.price - old_price) / old_price) * 100
        
        self.bought_this_chap = 0
        self.sold_this_chap = 0
        
        return percent_change

def main():
    stocks = [
        Stock("Luffy", 1000, 0),
        Stock("Shanks", 500, 0),
        Stock("Kaido", 250, 0),
        Stock("Buggy", 50, 0),
        Stock("Kidd", 10, 0)
    ]
    
    while True:
        print("\nCurrent Stock Market Status:")
        print("----------------------------------------")
        for i, stock in enumerate(stocks, 1):
            print(f"{i}. {stock.name:20} Price: {stock.price:.2f} Berries   Circulation: {stock.circulation}")
        
        print("\nEnter trading activity for this chapter:")
        print("(Enter 0 to skip a stock, -1 to end simulation)")
        
        for stock in stocks:
            print(f"\n{stock.name}:")
            try:
                bought = float(input("Bought this chapter: "))
                if bought == -1:
                    return
                if bought < 0:
                    print("Please enter a non-negative number")
                    continue
                    
                sold = float(input("Sold this chapter: "))
                if sold == -1:
                    return
                if sold < 0:
                    print("Please enter a non-negative number")
                    continue
                
                stock.bought_this_chap = bought
                stock.sold_this_chap = sold
                
            except ValueError:
                print("Please enter valid numbers")
                continue
        
        print("\nChapter End - Price Updates:")
        print("----------------------------------------")
        
        for stock in stocks:
            percent_change = stock.update_price()
            change_symbol = "📈" if percent_change > 0 else "📉"
            print(f"{stock.name:20} New Price: {stock.price:.2f} Berries ({percent_change:+.2f}%) {change_symbol}")

if __name__ == "__main__":
    print("Welcome to the One Piece Stock Market Simulator!")
    main()

