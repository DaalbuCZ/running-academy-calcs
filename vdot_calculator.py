"""
VDOT Running Calculator
A utility for calculating training paces based on race performance
Using Dr. Jack Daniels' VDOT formulas
"""

import math
import argparse


def is_positive_integer(value):
    """
    Validates if a number is a positive integer

    Args:
        value: The value to check

    Returns:
        bool: True if the value is a positive integer
    """
    return not value or (isinstance(value, int) and value > 0)


def calculate_pace_adjustment(value):
    """
    Calculates pace adjustments based on a value

    Args:
        value: Input value to calculate pace

    Returns:
        float: The calculated pace adjustment
    """
    return 29.54 + 5.000663 * value - 0.007546 * value * value


def format_pace(pace, is_miles=False):
    """
    Formats pace time as a string

    Args:
        pace: Pace in time per distance
        is_miles: Whether to use miles (True) or kilometers (False)

    Returns:
        str: Formatted pace string (e.g. "8:30")
    """
    t = (1 / pace) * (1609 if is_miles else 1000)
    minutes = math.floor(t)
    seconds = math.floor(60 * (t - minutes))
    return f"{minutes}:{seconds:02d}"


def calculate_vdot(distance, time):
    """
    Calculates VDOT value from race performance

    Args:
        distance: Race distance in meters
        time: Race time in minutes

    Returns:
        float: The calculated VDOT value
    """
    speed_value = distance / time
    vdot_value = calculate_vdot_from_speed(speed_value) / calculate_time_correction(
        time
    )
    return vdot_value


def calculate_vdot_from_speed(speed):
    """
    Calculate VDOT component from speed

    Args:
        speed: Speed in meters per minute

    Returns:
        float: Calculated component
    """
    return 0.182258 * speed - 4.6 + 0.000104 * speed * speed


def calculate_time_correction(time):
    """
    Calculate time correction factor for VDOT

    Args:
        time: Time in minutes

    Returns:
        float: Correction factor
    """
    return (
        0.8
        + 0.1894393 * math.exp(-0.012778 * time)
        + 0.2989558 * math.exp(-0.1932695 * time)
    )


def calculate_training_paces(vdot):
    """
    Calculates all training paces based on VDOT

    Args:
        vdot: The VDOT value

    Returns:
        dict: Dictionary containing all training paces
    """
    easy_pace = calculate_pace_adjustment(0.7 * vdot)
    tempo_pace = calculate_pace_adjustment(0.88 * vdot)
    interval_pace = calculate_pace_adjustment(vdot)
    rep_pace = calculate_pace_adjustment(1.1 * vdot)

    return {
        "easy": {
            "pace": easy_pace,
            "pace_per_mile": format_pace(easy_pace, True),
            "pace_per_km": format_pace(easy_pace, False),
        },
        "tempo": {
            "pace": tempo_pace,
            "pace_per_mile": format_pace(tempo_pace, True),
            "pace_per_km": format_pace(tempo_pace, False),
        },
        "interval": {
            "pace": interval_pace,
            "pace_per_mile": format_pace(interval_pace, True),
            "pace_per_km": format_pace(interval_pace, False),
        },
        "repetition": {
            "pace": rep_pace,
            "pace_per_mile": format_pace(rep_pace, True),
            "pace_per_km": format_pace(rep_pace, False),
        },
        "long_run": {
            "pace_per_mile": f"{format_pace(easy_pace, True)} - {format_pace(calculate_pace_adjustment(0.6 * vdot), True)}",
            "pace_per_km": f"{format_pace(easy_pace, False)} - {format_pace(calculate_pace_adjustment(0.6 * vdot), False)}",
        },
        "yasso_800s": {
            "pace_per_lap": format_pace(1.95 * interval_pace, True),
        },
    }


def calculate_race_time(vdot, distance):
    """
    Calculates race performance from VDOT and distance

    Args:
        vdot: The VDOT value
        distance: Race distance in meters

    Returns:
        float: Predicted race time in minutes
    """
    # This is a simplified implementation that could be expanded
    # based on the original algorithm
    return distance / (
        calculate_vdot_from_speed(vdot) / calculate_time_correction(vdot)
    )


def calculate_from_race(race_distance, hours, minutes, seconds):
    """
    Main function to calculate training paces from race performance

    Args:
        race_distance: Race distance in meters
        hours: Hours component of race time
        minutes: Minutes component of race time
        seconds: Seconds component of race time

    Returns:
        dict: Dictionary containing VDOT and training paces
    """
    # Validate inputs
    if (
        not is_positive_integer(hours)
        or not is_positive_integer(minutes)
        or not is_positive_integer(seconds)
    ):
        raise ValueError("Please input a valid time.")

    time_in_minutes = hours * 60 + minutes + seconds / 60
    if time_in_minutes <= 0:
        raise ValueError("Please input a valid time.")

    if not race_distance or race_distance <= 0:
        raise ValueError("Please input a valid race length.")

    # Calculate VDOT
    vdot = calculate_vdot(race_distance, time_in_minutes)

    if vdot <= 0:
        raise ValueError("Please input a valid race length and time.")

    # Get training paces
    training_paces = calculate_training_paces(vdot)

    return {
        "vdot": vdot,
        "training_paces": training_paces,
    }


def display_results(results):
    """
    Display the calculated VDOT and training paces

    Args:
        results: Dictionary containing VDOT and training paces
    """
    vdot = results["vdot"]
    paces = results["training_paces"]

    print("\n=== VDOT RUNNING CALCULATOR RESULTS ===")
    print(f"VDOT Score: {vdot:.1f}\n")

    print("TRAINING PACES:")
    print(
        f"Easy Run:          {paces['easy']['pace_per_mile']} min/mile   |   {paces['easy']['pace_per_km']} min/km"
    )
    print(
        f"Tempo Run:         {paces['tempo']['pace_per_mile']} min/mile   |   {paces['tempo']['pace_per_km']} min/km"
    )
    print(
        f"Interval Training: {paces['interval']['pace_per_mile']} min/mile   |   {paces['interval']['pace_per_km']} min/km"
    )
    print(
        f"Repetition:        {paces['repetition']['pace_per_mile']} min/mile   |   {paces['repetition']['pace_per_km']} min/km"
    )
    print(
        f"Long Run:          {paces['long_run']['pace_per_mile']} min/mile   |   {paces['long_run']['pace_per_km']} min/km"
    )
    print(f"Yasso 800s:        {paces['yasso_800s']['pace_per_lap']} min/800m")
    print("========================================\n")


def convert_distance_to_meters(distance, unit):
    """
    Convert distance to meters based on unit

    Args:
        distance: Distance value
        unit: Unit of distance ('km', 'mi', or 'm')

    Returns:
        float: Distance in meters
    """
    if unit == "km":
        return distance * 1000
    elif unit == "mi":
        return distance * 1609.34
    else:  # Already in meters
        return distance


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="VDOT Running Calculator")
    parser.add_argument("distance", type=float, help="Race distance")
    parser.add_argument(
        "--unit",
        choices=["km", "mi", "m"],
        default="km",
        help="Distance unit (km, mi, or m)",
    )
    parser.add_argument("--hours", type=int, default=0, help="Race time hours")
    parser.add_argument("--minutes", type=int, default=0, help="Race time minutes")
    parser.add_argument("--seconds", type=int, default=0, help="Race time seconds")

    args = parser.parse_args()

    try:
        # Convert distance to meters
        distance_in_meters = convert_distance_to_meters(args.distance, args.unit)

        # Calculate VDOT and training paces
        results = calculate_from_race(
            distance_in_meters, args.hours, args.minutes, args.seconds
        )

        # Display results
        display_results(results)

    except ValueError as e:
        print(f"Error: {e}")
