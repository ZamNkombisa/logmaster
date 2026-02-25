from datetime import timedelta

def generate_log_itinerary(distance_miles, start_datetime):
    """
    Calculates the sequence of events for a trip based on FMCSA rules.
    """
    avg_speed = 65  # mph
    events = []
    current_time = start_datetime
    
    # 1. Start with Pickup (Requirement: 1 hour)
    events.append({
        'status': 'ON',
        'start': current_time,
        'end': current_time + timedelta(hours=1),
        'location': 'Origin',
        'remarks': 'Loading / Pickup'
    })
    current_time += timedelta(hours=1)

    # 2. Driving Logic
    remaining_miles = distance_miles
    miles_since_fuel = 0

    while remaining_miles > 0:
        # How far can we go before needing a 10-hour break? (11 hours max)
        max_miles_before_break = 11 * avg_speed 
        
        # How far can we go before needing fuel? (1000 miles)
        max_miles_before_fuel = 1000 - miles_since_fuel
        
        # We take the shortest distance of the two
        miles_to_drive = min(remaining_miles, max_miles_before_break, max_miles_before_fuel)
        drive_duration = miles_to_drive / avg_speed
        
        events.append({
            'status': 'D',
            'start': current_time,
            'end': current_time + timedelta(hours=drive_duration),
            'location': 'En Route',
            'remarks': f'Driving {round(miles_to_drive)} miles'
        })
        
        current_time += timedelta(hours=drive_duration)
        remaining_miles -= miles_to_drive
        miles_since_fuel += miles_to_drive

        # 3. Check for Fueling (Requirement: Every 1,000 miles)
        if miles_since_fuel >= 1000:
            events.append({
                'status': 'ON',
                'start': current_time,
                'end': current_time + timedelta(minutes=30),
                'location': 'Fuel Station',
                'remarks': 'Fueling'
            })
            current_time += timedelta(minutes=30)
            miles_since_fuel = 0

        # 4. Check for Sleep (Requirement: 10 hours off after 11 hours driving)
        if remaining_miles > 0:
            events.append({
                'status': 'SB',
                'start': current_time,
                'end': current_time + timedelta(hours=10),
                'location': 'Truck Stop',
                'remarks': '10-hour Rest Break'
            })
            current_time += timedelta(hours=10)

    # 5. Final Drop-off (Requirement: 1 hour)
    events.append({
        'status': 'ON',
        'start': current_time,
        'end': current_time + timedelta(hours=1),
        'location': 'Destination',
        'remarks': 'Unloading / Drop-off'
    })

    return events