# Electricity Maps API Integration

This portal now includes real-time carbon intensity and power generation data for South Africa via the Electricity Maps API.

## Features

### Carbon Intensity Tracking
- Real-time carbon intensity measurements (gCO₂eq/kWh)
- Color-coded intensity levels (Very Low to Very High)
- Historical trend awareness

### Power Generation Breakdown
- Renewable energy percentage
- Fossil-free energy percentage
- Detailed breakdown by source:
  - Solar
  - Wind
  - Hydro
  - Coal
  - Gas
  - Nuclear
  - Other sources

### Integration Points
The Carbon Intensity Widget is displayed in:
1. **Citizen Dashboard** - Shows environmental impact of municipal electricity
2. **Transparency Portal** - Public visibility of energy sources and sustainability

## Setup Instructions

### 1. Get Your API Key

1. Visit [Electricity Maps Portal](https://portal.electricitymaps.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the API key

### 2. Configure the API Key

The system has prompted you to enter your Electricity Maps API key in the `ELECTRICITY_MAPS_API_KEY` environment variable. If you need to update it:

1. Access your Supabase project dashboard
2. Go to Project Settings → Edge Functions
3. Add or update the environment variable:
   - Name: `ELECTRICITY_MAPS_API_KEY`
   - Value: Your API key from Electricity Maps

### 3. Verify Integration

Once configured, the Carbon Intensity Widget will:
- Display in the Citizen Dashboard
- Show in the Public Transparency Portal
- Auto-refresh every 15 minutes
- Show real-time data for South Africa (zone: ZA)

## API Endpoints Used

The integration calls two Electricity Maps API endpoints:

### Carbon Intensity
```
GET https://api.electricitymap.org/v3/carbon-intensity/latest?zone=ZA
```
Returns current carbon intensity for South Africa

### Power Breakdown
```
GET https://api.electricitymap.org/v3/power-breakdown/latest?zone=ZA
```
Returns current power generation breakdown by source

## Data Refresh

- Widget automatically refreshes every 15 minutes
- Manual refresh available by reloading the page
- Graceful error handling if API is unavailable

## Zone Configuration

Currently configured for South Africa (zone: ZA). To add support for other regions:

1. Edit `/components/CarbonIntensityWidget.tsx`
2. Modify the zone parameter based on user location
3. Refer to [Electricity Maps Zone Documentation](https://api.electricitymap.org/v3/zones)

## Error Handling

The integration includes comprehensive error handling:
- Missing API key detection
- API rate limit handling
- Partial data display (shows carbon intensity even if power breakdown fails)
- User-friendly error messages

## Pricing & Usage

Please review [Electricity Maps Pricing](https://www.electricitymaps.com/pricing) for API usage limits and costs. The integration:
- Calls API every 15 minutes per active user
- Uses 2 endpoints per refresh
- Recommended: Monitor your API usage in the Electricity Maps dashboard

## Benefits for Your Portal

1. **Environmental Transparency**: Show citizens the carbon footprint of their electricity usage
2. **Sustainability Awareness**: Educate users about renewable energy adoption
3. **Public Accountability**: Demonstrate commitment to environmental monitoring
4. **Data-Driven Decisions**: Help citizens choose optimal times for high-energy activities

## Troubleshooting

### Widget Not Displaying
- Verify API key is correctly configured
- Check browser console for error messages
- Confirm Supabase Edge Function is deployed

### "API key not configured" Error
- Ensure `ELECTRICITY_MAPS_API_KEY` environment variable is set
- Redeploy Edge Functions after adding the variable

### Data Not Updating
- Check API rate limits in Electricity Maps dashboard
- Verify internet connectivity to api.electricitymap.org
- Review server logs for API errors

## Additional Resources

- [Electricity Maps API Documentation](https://portal.electricitymaps.com/docs/)
- [Zone List](https://api.electricitymap.org/v3/zones)
- [API Status Page](https://status.electricitymap.org/)
