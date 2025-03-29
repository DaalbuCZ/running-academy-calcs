"""
Running Pace Calculator
Utility functions for calculating training paces based on race performance
"""

import math
import argparse


def is_valid_input(value):
    """
    Validates if the input is a positive integer or zero

    Args:
        value: The value to validate

    Returns:
        bool: True if valid, false otherwise
    """
    return not value or (isinstance(value, int) and value > 0)


def calculate_pace_factor(value):
    """
    Calculates a pace factor based on an input value

    Args:
        value: The input value

    Returns:
        float: The calculated pace factor
    """
    return 29.54 + 5.000663 * value - 0.007546 * value * value


def format_pace(pace_value, is_miles=False):
    """
    Formats a pace value to minutes:seconds format

    Args:
        pace_value: The pace value
        is_miles: Whether the pace is in miles (True) or kilometers (False)

    Returns:
        str: The formatted pace (e.g., "5:30")
    """
    pace = 1 / pace_value * (1609 if is_miles else 1000)
    minutes = math.floor(pace)
    seconds = math.floor(60 * (pace - minutes))
    return f"{minutes}:{seconds:02d}"


def calculate_vo2_max(distance_meters, time_minutes):
    """
    Calculates VO2max from distance and time

    Args:
        distance_meters: Race distance in meters
        time_minutes: Race time in minutes

    Returns:
        float: The calculated VO2max value
    """
    speed = distance_meters / time_minutes
    raw_vo2_max = 0.182258 * speed - 4.6 + 0.000104 * speed * speed
    age_factor = (
        0.8
        + 0.1894393 * math.exp(-0.012778 * time_minutes)
        + 0.2989558 * math.exp(-0.1932695 * time_minutes)
    )
    return raw_vo2_max / age_factor


def calculate_training_paces(vo2max, in_miles=True):
    """
    Calculates training paces based on VO2max

    Args:
        vo2max: The VO2max value
        in_miles: Whether to return paces in miles (True) or kilometers (False)

    Returns:
        dict: Dictionary containing various training paces
    """
    easy_pace_factor = calculate_pace_factor(0.7 * vo2max)
    vo2max_pace_factor = calculate_pace_factor(vo2max)

    return {
        "easy": format_pace(easy_pace_factor, in_miles),
        "tempo": format_pace(calculate_pace_factor(0.88 * vo2max), in_miles),
        "vo2max": format_pace(vo2max_pace_factor, in_miles),
        "speed_form": format_pace(calculate_pace_factor(1.1 * vo2max), in_miles),
        "long_run_lower": format_pace(easy_pace_factor, in_miles),
        "long_run_upper": format_pace(calculate_pace_factor(0.6 * vo2max), in_miles),
        "yasso_800": format_pace(1.95 * vo2max_pace_factor, True),
    }


def calculate_paces(
    race_distance, is_kilometers, hours, minutes, seconds, output_in_miles=True
):
    """
    Main function to calculate all training paces based on race results

    Args:
        race_distance: Race distance in kilometers or miles
        is_kilometers: Whether the distance is in kilometers (True) or miles (False)
        hours: Race time hours
        minutes: Race time minutes
        seconds: Race time seconds
        output_in_miles: Whether to output paces in min/mile (True) or min/km (False)

    Returns:
        dict or None: Training paces dictionary or None if inputs are invalid
    """
    # Validate inputs
    if not race_distance or race_distance <= 0:
        return None  # Invalid race length

    if (
        not is_valid_input(hours)
        or not is_valid_input(minutes)
        or not is_valid_input(seconds)
    ):
        return None  # Invalid time inputs

    # Calculate total time in minutes
    total_time_minutes = (hours * 60) + minutes + (seconds / 60)

    if total_time_minutes <= 0:
        return None  # Invalid time

    # Convert distance to meters
    distance_meters = race_distance * (1000 if is_kilometers else 1609)

    # Calculate VO2max
    vo2max = calculate_vo2_max(distance_meters, total_time_minutes)

    if vo2max <= 0:
        return None  # Invalid VO2max result

    # Return all training paces
    return calculate_training_paces(vo2max, output_in_miles)


def display_paces(paces):
    """
    Display the calculated training paces

    Args:
        paces: Dictionary of training paces
    """
    if paces is None:
        print("Error: Could not calculate paces with the given inputs.")
        return

    print("\n----- TRAINING PACES -----")
    print(f"Easy Run Pace:      {paces['easy']}")
    print(f"Tempo Run Pace:     {paces['tempo']}")
    print(f"VO2max Pace:        {paces['vo2max']}")
    print(f"Speed/Form Pace:    {paces['speed_form']}")
    print(f"Long Run Pace:      {paces['long_run_lower']} - {paces['long_run_upper']}")
    print(f"Yasso 800s Pace:    {paces['yasso_800']}")
    print("--------------------------\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Running Pace Calculator")
    parser.add_argument("distance", type=float, help="Race distance")
    parser.add_argument(
        "--km", action="store_true", help="Distance is in kilometers (default is miles)"
    )
    parser.add_argument("--hours", type=int, default=0, help="Race time hours")
    parser.add_argument("--minutes", type=int, default=0, help="Race time minutes")
    parser.add_argument("--seconds", type=int, default=0, help="Race time seconds")
    parser.add_argument(
        "--output-km",
        action="store_true",
        help="Output paces in min/km (default is min/mile)",
    )

    args = parser.parse_args()

    # Calculate paces
    paces = calculate_paces(
        args.distance,
        args.km,
        args.hours,
        args.minutes,
        args.seconds,
        not args.output_km,
    )

    # Display results
    display_paces(paces)
