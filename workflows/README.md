# Subcontractor Lead Generator Workflow

An n8n workflow that automatically finds subcontractors and service providers near your facility using Google Maps, with built-in deduplication to ensure you only get fresh leads.

## Features

- **Location-Based Search**: Search for businesses within a specified radius of your facility
- **Google Maps Integration**: Uses Google Places API to find businesses
- **Contact Information**: Retrieves phone numbers, websites, and addresses
- **Deduplication**: Automatically filters out previously contacted leads
- **Quality Filtering**: Only returns operational businesses with valid phone numbers
- **Lead Scoring**: Sorts leads by rating and review count
- **Email Outreach**: Optional email sending with automatic tracking
- **Scheduled Runs**: Can run daily to find new leads automatically

## Setup Instructions

### 1. Import the Workflow

1. Open your n8n instance
2. Go to **Workflows** > **Import from File**
3. Select `subcontractor-search-workflow.json`

### 2. Set Up Google API Credentials

You'll need a Google Cloud Platform project with the following APIs enabled:
- **Geocoding API** - For converting addresses to coordinates
- **Places API** - For searching nearby businesses

#### Steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Geocoding API** and **Places API**
4. Go to **Credentials** > **Create Credentials** > **API Key**
5. Copy the API key

In n8n:
1. Go to **Credentials** > **New**
2. Search for "Header Auth"
3. Name: `Google API Key`
4. Add your API key

### 3. Set Up Google Sheets for Lead Tracking

Create a Google Spreadsheet with two sheets:

#### Sheet 1: "New Leads"
Columns:
- place_id
- business_name
- address
- phone
- website
- rating
- total_ratings
- business_status
- types
- found_date
- contacted
- email_sent

#### Sheet 2: "Contacted Leads"
Same columns as above (leads are moved here after contact)

### 4. Configure Environment Variables

Set these environment variables in your n8n instance:

```
LEADS_SPREADSHEET_ID=your_google_sheet_id
FROM_EMAIL=your-email@company.com
```

### 5. Set Up Google Sheets Credentials in n8n

1. Go to **Credentials** > **New**
2. Search for "Google Sheets OAuth2"
3. Follow the OAuth setup process

## Workflow Configuration

### Search Parameters

Edit the **"Search Configuration"** node to customize:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `facility_address` | Your facility's address (center point) | `123 Main St, Los Angeles, CA` |
| `search_radius_meters` | Search radius in meters | `16093` (≈10 miles) |
| `business_type` | Google Places type | `contractor` |
| `search_keyword` | Keywords to search | `plumber electrician HVAC` |

### Common Search Radius Values

| Miles | Meters |
|-------|--------|
| 5 | 8047 |
| 10 | 16093 |
| 15 | 24140 |
| 20 | 32187 |
| 25 | 40234 |

### Business Type Examples

- `contractor`
- `electrician`
- `plumber`
- `general_contractor`
- `roofing_contractor`
- `hvac_contractor`

## How Deduplication Works

1. **Initial Search**: Workflow searches Google Places for businesses
2. **Fetch Contacted List**: Loads all leads from "Contacted Leads" sheet
3. **Compare by Place ID**: Uses Google's unique `place_id` to identify businesses
4. **Filter Out Duplicates**: Removes any businesses already in the contacted list
5. **Save New Leads**: Only fresh leads are saved to "New Leads" sheet

### Managing Contacted Leads

When you contact a lead (call or email):
1. Move the row from "New Leads" to "Contacted Leads" sheet
2. The workflow will automatically exclude them from future searches

## Email Outreach (Optional)

The workflow includes an optional email section:

1. Enable by setting `send_email: true` in your trigger data
2. Configure your email credentials in n8n (SMTP or email service)
3. Customize the email template in the "Send Outreach Email" node
4. After sending, leads are automatically moved to "Contacted Leads"

## Running the Workflow

### Manual Execution
- Click "Execute Workflow" in n8n
- Or use the Manual Trigger node

### Scheduled Execution
- The "Daily Schedule" trigger runs automatically every day
- Modify the schedule in the node settings as needed

### Via Webhook (Advanced)
Add a Webhook trigger to run searches on-demand with custom parameters:

```bash
curl -X POST https://your-n8n.com/webhook/subcontractor-search \
  -H "Content-Type: application/json" \
  -d '{
    "facility_address": "456 Business Ave, San Francisco, CA",
    "search_radius_meters": "8047",
    "search_keyword": "plumber"
  }'
```

## Output

The workflow outputs:
- **New Leads**: Saved to Google Sheets with full contact info
- **Summary**: Count of new leads found

Each lead includes:
- Business name
- Full address
- Phone number
- Website
- Google rating
- Number of reviews
- Business status
- Business categories
- Date found

## Troubleshooting

### No results found
- Check your API key has Places and Geocoding APIs enabled
- Verify the facility address is valid
- Try broader search keywords
- Increase the search radius

### API Quota Errors
- Google Places API has usage limits
- Consider adding delays between requests
- Upgrade your Google Cloud billing plan if needed

### Duplicate leads appearing
- Ensure the "Contacted Leads" sheet has the correct `place_id` values
- Check the Google Sheets credentials are working
- Verify the sheet names match exactly

## Cost Considerations

Google Places API pricing (as of 2024):
- Nearby Search: $32 per 1,000 requests
- Place Details: $17 per 1,000 requests
- Geocoding: $5 per 1,000 requests

For a typical daily run with ~60 businesses:
- ~3 Nearby Search requests (pagination)
- ~60 Place Details requests
- ~1 Geocoding request
- **Estimated cost**: ~$1.20/day

## Support

For issues with:
- **This workflow**: Open an issue in the repository
- **n8n**: Visit [n8n Community](https://community.n8n.io/)
- **Google APIs**: See [Google Cloud Documentation](https://cloud.google.com/docs)
