import math

# Constants
SENSITIVITY = 0.1  # Maximum price change per cycle (10%)
C = 0.2  # Controls how fast the tanh function saturates
BETA = 0.3  # Weight for rolling baseline (0.3 means 30% new data, 70% old)

INITIAL_BERRIES = 100000  # Starting Berries for users

# Define 5 random One Piece stocks with initial prices and rolling baselines
stocks = {
    "Luffy": {"price": 1000, "bought": 0, "sold": 0, "baseline": 100000},
    "Zoro": {"price": 800, "bought": 0, "sold": 0, "baseline": 80000},
    "Usopp": {"price": 50, "bought": 0, "sold": 0, "baseline": 5000},
    "Nami": {"price": 600, "bought": 0, "sold": 0, "baseline": 60000},
    "Sanji": {"price": 700, "bought": 0, "sold": 0, "baseline": 70000},
}

# Function to calculate price change using tanh dampening
def calculate_price_change(data):
    actual_spending = data["bought"] * data["price"]  # Total money spent on this stock
    baseline_spending = data["baseline"]  # Expected spending

    if baseline_spending == 0:  # Avoid division by zero
        return 0

    demand_factor = (actual_spending - baseline_spending) / baseline_spending
    adjustment = SENSITIVITY * math.tanh(demand_factor / C)

    return data["price"] * adjustment  # Change in price

# Function to update stock prices
def update_stock_prices(stocks):
    for stock, data in stocks.items():
        price_change = calculate_price_change(data)
        new_price = max(data["price"] + price_change, 0)  # Prevent negative prices
        stocks[stock]["price"] = new_price

        # Update rolling baseline
        actual_spending = data["bought"] * data["price"]
        stocks[stock]["baseline"] = BETA * actual_spending + (1 - BETA) * data["baseline"]

    return stocks

# Function to display stock prices
def display_stock_prices(stocks):
    print("\nCurrent Stock Prices:")
    for stock, data in stocks.items():
        print(f"{stock}: {data['price']:.2f} Berries")

# Function to take user input for buys and sells
def get_user_input(stocks):
    print("\nEnter the number of shares bought and sold for each stock:")
    for stock in stocks:
        bought = int(input(f"How many {stock} stocks were bought? "))
        sold = int(input(f"How many {stock} stocks were sold? "))
        stocks[stock]["bought"] = bought
        stocks[stock]["sold"] = sold
    return stocks

# Function to display percentage change
def display_percentage_changes(initial_prices, updated_stocks):
    print("\nPercentage Change in Stock Prices:")
    for stock, data in updated_stocks.items():
        initial_price = initial_prices[stock]
        new_price = data["price"]
        percent_change = ((new_price - initial_price) / initial_price) * 100
        print(f"{stock}: {percent_change:.2f}%")

# Main program
if __name__ == "__main__":
    print("Welcome to the One Piece Stock Market!")
    print(f"Each user starts with {INITIAL_BERRIES} Berries.\n")

    # Display initial stock prices
    display_stock_prices(stocks)

    # Save initial prices for percentage change calculation
    initial_prices = {stock: data["price"] for stock, data in stocks.items()}

    # Get user input for buys and sells
    stocks = get_user_input(stocks)

    # Update stock prices based on user input
    updated_stocks = update_stock_prices(stocks)

    # Display updated stock prices
    print("\nUpdated Stock Prices After Market Close:")
    display_stock_prices(updated_stocks)

    # Display percentage changes
    display_percentage_changes(initial_prices, updated_stocks)

    # mongod --replSet rs0 --dbpath ~/data/db --port 27017

    # mongosh --port 27017

