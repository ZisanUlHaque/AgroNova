import math

def calculate_saturation_vapor_pressure(temp_c: float) -> float:
    """
    Computes saturation vapor pressure e°(T) in kPa for temperature T in Celsius.
    FAO-56 eq. 11: e°(T) = 0.6108 * exp((17.27 * T) / (T + 237.3))
    """
    return 0.6108 * math.exp((17.27 * temp_c) / (temp_c + 237.3))

def calculate_slope_vapor_pressure(temp_c: float) -> float:
    """
    Computes slope of saturation vapor pressure curve Delta in kPa / °C.
    FAO-56 eq. 13: Delta = (4098 * (0.6108 * exp((17.27 * T) / (T + 237.3)))) / ((T + 237.3)**2)
    """
    es = calculate_saturation_vapor_pressure(temp_c)
    return (4098.0 * es) / ((temp_c + 237.3) ** 2)

def calculate_psychrometric_constant(elevation_m: float = 10.0) -> float:
    """
    Computes psychrometric constant gamma in kPa / °C given elevation.
    Atmospheric pressure P = 101.3 * ((293 - 0.0065 * z) / 293) ** 5.26
    gamma = 0.665e-3 * P
    """
    pressure = 101.3 * (((293.0 - 0.0065 * elevation_m) / 293.0) ** 5.26)
    return 0.000665 * pressure

def compute_daily_et0(
    t_max: float,
    t_min: float,
    rh_mean: float,
    wind_speed_2m: float,
    solar_rad_mj_m2: float,
    elevation_m: float = 10.0
) -> float:
    """
    Computes daily reference evapotranspiration ET0 (mm/day) using FAO-56 Penman-Monteith equation.
    
    Inputs:
    - t_max: Maximum daily air temperature (°C)
    - t_min: Minimum daily air temperature (°C)
    - rh_mean: Mean daily relative humidity (%)
    - wind_speed_2m: Wind speed at 2 m height (m/s)
    - solar_rad_mj_m2: Downward shortwave solar radiation (MJ / m^2 / day)
    - elevation_m: Station elevation above sea level in meters (default 10m for Bangladesh delta)
    
    Returns:
    - ET0 in mm / day
    """
    t_mean = (t_max + t_min) / 2.0
    
    # Delta: slope of saturation vapor pressure curve
    delta = calculate_slope_vapor_pressure(t_mean)
    
    # Psychrometric constant
    gamma = calculate_psychrometric_constant(elevation_m)
    
    # Vapor pressures
    es_max = calculate_saturation_vapor_pressure(t_max)
    es_min = calculate_saturation_vapor_pressure(t_min)
    es = (es_max + es_min) / 2.0
    ea = es * (max(1.0, min(100.0, rh_mean)) / 100.0)
    vpd = max(0.0, es - ea) # Vapor pressure deficit
    
    # Net radiation Rn estimation from global solar radiation Rs
    # For grass reference: albedo alpha ~ 0.23, net radiation Rn ~ 0.6 * Rs to 0.7 * Rs
    rn = 0.60 * max(0.0, solar_rad_mj_m2)
    g = 0.0 # Soil heat flux is negligible for daily timesteps
    
    u2 = max(0.2, wind_speed_2m) # Cap minimum wind speed at 0.2 m/s
    
    # FAO-56 Penman-Monteith equation
    num1 = 0.408 * delta * (rn - g)
    num2 = gamma * (900.0 / (t_mean + 273.0)) * u2 * vpd
    denom = delta + gamma * (1.0 + 0.34 * u2)
    
    et0 = (num1 + num2) / denom
    return max(0.1, round(et0, 2))
