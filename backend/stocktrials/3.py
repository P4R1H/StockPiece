def calculate_price_update(current_price, prev_circulation, bought_this_chap, sold_this_chap):
    #current price we have
    #prev_circulation is the baseQuantity,
    #bought this chap we total buys
    #sold this chap is the total sells 
    total_volume = bought_this_chap + sold_this_chap
    if total_volume == 0:
        return current_price

    # Prevent division by zero in volume impact calculation
    effective_circulation = max(prev_circulation, 1)
    
    # Calculate net pressure (-1 to +1)
    buy_pressure = (bought_this_chap - sold_this_chap) / total_volume
    
    # Volume ratio (trading volume relative to circulation)
    volume_ratio = total_volume / effective_circulation
    volume_impact = math.log(1 + volume_ratio) * 2
    
    # Separate logic for price rises and falls
    if buy_pressure >= 0:
        # Dampening factor for expensive stocks
        price_dampener = 1 / (1 + math.log(1 + current_price / 100))
        # Increase max rise allowed if volume_ratio > 1
        extra_rise_factor = volume_ratio if volume_ratio > 1 else 1
        max_rise_percent = (300 / (1 + math.log(1 + current_price / 50))) * extra_rise_factor

        raw_percent_change = buy_pressure * volume_impact * price_dampener * 100
        percent_change = min(raw_percent_change, max_rise_percent)
    else:
        # For declines, amplify drop if selling dominates
        sell_ratio = sold_this_chap / total_volume
        drop_multiplier = 1 + max(0, sell_ratio - 0.5)  # extra penalty if >50% of trades are sells
        
        price_dampener = 1 / (1 + math.log(1 + current_price / 100))
        raw_percent_change = buy_pressure * volume_impact * price_dampener * 100 * drop_multiplier
        # Allow a larger drop than rise cap (e.g. 20% more)
        max_drop_percent = (300 / (1 + math.log(1 + current_price / 50))) * 1.2
        percent_change = max(raw_percent_change, -max_drop_percent)
    
    new_price = current_price * (1 + percent_change / 100)
    return max(new_price, 10)  # Ensure price never falls below 1 cent