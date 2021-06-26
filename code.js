var CLIENT_ID = '';
var CLIENT_SECRET = '';



function fetchFacebookInsights(startDate, endDate, accountId, requestedFieldIds) {
  var fbFields = []


  for (var i = 0; i < requestedFieldIds.length; i++) {
    fbFields.push(requestedFieldIds[i])

  }



  var requestEndpoint = "https://graph.facebook.com/v10.0/" + accountId + "/insights?"
  var timeRange = { 'since': startDate.toISOString().substring(0, 10), 'until': endDate.toISOString().substring(0, 10) };
  var requestUrl = requestEndpoint + "time_increment=1";

  requestUrl += "&limit=100000";
  requestUrl += "&level=ad";
  requestUrl += "&fields=" + fbFields.join(",");
  requestUrl += "&time_range=" + encodeURIComponent(JSON.stringify(timeRange));
  requestUrl += "&access_token=" + getOAuthService().getAccessToken()

  var parseData;
  try {
    var response = UrlFetchApp.fetch(requestUrl, {
      muteHttpExceptions: true
    });
    parseData = JSON.parse(response);
  } catch (e) {
    console.log(e);
  }

  return parseData.data;
}

function getConfig() {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config.newInfo()
    .setId('instructions')
    .setText('Please enter the configuration data for your Facebook connector');
  let parseData
  const options = []
  try {
    const response = UrlFetchApp.fetch("https://graph.facebook.com/v10.0/me/adaccounts?access_token=" + getOAuthService().getAccessToken())
    parseData = JSON.parse(response);
    parseData.data.map((account) => {
      options.push(config.newOptionBuilder()
        .setLabel(account.account_id)
        .setValue(account.id))
    })

  } catch (e) {

  }
  const accountIdSelector = config.newSelectSingle()
    .setId("ads_account_id")
    .setName("Ad Account ID")
    .setHelpText("Select your ad account ID");


  options.forEach((option) => {
    accountIdSelector.addOption(option)
  })



  config.setDateRangeRequired(true);

  return config.build();
}

function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields.newDimension()
    .setId('date_start')
    .setName('Date')
    .setType(types.YEAR_MONTH_DAY);

  fields.newDimension()
    .setId('campaign_name')
    .setName('Campaign')
    .setType(types.TEXT);

  fields.newDimension()
    .setId('adset_name')
    .setName('Adset')
    .setType(types.TEXT);

  fields.newDimension()
    .setId('ad_name')
    .setName('Ad')
    .setType(types.TEXT);

  fields.newDimension()
    .setId('buying_type')
    .setName('Buying Type')
    .setType(types.TEXT);

  fields.newMetric()
    .setId('cpc')
    .setName('cpc')
    .setDescription('Cost per click')
    .setType(types.CURRENCY_EUR)
    .setAggregation(aggregations.AVG);

  fields.newMetric()
    .setId('cpm')
    .setName('cpm')
    .setDescription('Cost per 1000 impressions')
    .setType(types.CURRENCY_EUR)
    .setAggregation(aggregations.AVG);

  fields.newMetric()
    .setId('cpp')
    .setName('cpp')
    .setDescription('cost to react 1,000 people')
    .setType(types.CURRENCY_EUR)
    .setAggregation(aggregations.AVG);

  fields.newMetric()
    .setId('ctr')
    .setName('ctr')
    .setDescription('The percentage of times people saw your ad and performed a click')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG);

  fields.newMetric()
    .setId('frequency')
    .setName('Frequency')
    .setDescription('The average number of times each person saw your ad')
    .setType(types.NUMBER)
    .setAggregation(aggregations.AVG);

  fields.newMetric()
    .setId('full_view_impressions')
    .setName('Full View Impressions')
    .setDescription("The number of Full Views on your Page's posts as a result of your ad")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('full_view_reach')
    .setName('Full View Reach')
    .setDescription("The number of people who performed a Full View on your Page's post as a result of your ad")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('inline_link_click_ctr')
    .setName('Inline ctr')
    .setDescription("The percentage of time people saw your ads and performed an inline link click")
    .setType(types.PERCENT)
    .setAggregation(aggregations.AVG);



  fields.newMetric()
    .setId('inline_link_clicks')
    .setName('Inline Clicks')
    .setDescription("The number of clicks on links to select destinations or experiences, on or off Facebook-owned properties. Inline link clicks use a fixed 1-day-click attribution window")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('inline_post_engagement')
    .setName('Inline post engagement')
    .setDescription("The total number of actions that people take involving your ads. Inline post engagements use a fixed 1-day-click attribution window")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newDimension()
    .setId('objective')
    .setName('Objective')
    .setDescription("The objective reflecting the goal you want to achieve with your advertising. It may be different from the selected objective of the campaign in some cases")
    .setType(types.TEXT)

  fields.newDimension()
    .setId('optimization_goal')
    .setName('Optimization Goal')
    .setDescription("The optimization goal you selected for your ad or ad set. Your optimization goal reflects what you want to optimize for the ads")
    .setType(types.TEXT)


  fields.newDimension()
    .setId('quality_ranking')
    .setName('Quality Ranking')
    .setDescription("A ranking of your ad's perceived quality. Quality is measured using feedback on your ads and the post-click experience. Your ad is ranked against ads that competed for the same audience.")
    .setType(types.TEXT)



  fields.newMetric()
    .setId('reach')
    .setName('Reach')
    .setDescription("The number of people who saw your ads at least once. Reach is different from impressions, which may include multiple views of your ads by the same people")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('unique_clicks')
    .setName('Unique clicks')
    .setDescription("The number of people who performed a click")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('unique_ctr')
    .setName('Unique CTR')
    .setDescription("The percentage of people who saw your ad and performed a unique click (all). This metric is estimated")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('unique_inline_link_click_ctr')
    .setName('Unique inline click CTR')
    .setDescription("The percentage of times people saw your ad and performed a link click")
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('canvas_avg_view_percent')
    .setName('Instant experience view')
    .setType(types.PERCENT)
    .setAggregation(aggregations.AVG);

  fields.newMetric()
    .setId('canvas_avg_view_time')
    .setName('Instant experience view time')
    .setType(types.DURATION)
    .setAggregation(aggregations.AVG);

  fields.newMetric()
    .setId('impressions')
    .setName('Impressions')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('clicks')
    .setName('Clicks')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('spend')
    .setName('Spend')
    .setType(types.CURRENCY_EUR)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('actions')
    .setName('Transactions')
    .setType(types.NUMBER)
    .setAggregation(aggregations.SUM);

  fields.newMetric()
    .setId('action_values')
    .setName('Revenue')
    .setType(types.CURRENCY_EUR)
    .setAggregation(aggregations.SUM);

  return fields;
}


function getSchema(request) {
  var fields = getFields().build();
  return {
    'schema': fields
  };
}


function getData(request) {
  var requestedFieldIds = request.fields.map(function (field) {
    return field.name;
  });

  var requestedFields = getFields().forIds(requestedFieldIds);
  var startDate = new Date(request['dateRange'].startDate);
  var endDate = new Date(request['dateRange'].endDate);
  var adsAccountId = request.configParams['ads_account_id'];

  //to maintain atleast a time difference of 7 days
  if (timePeriodInDays(startDate, endDate) < 7) {
    endDate = addDays(startDate, 7);
  }
  var facebookInsights = fetchFacebookInsights(startDate, endDate, adsAccountId, requestedFieldIds);
  console.log('Facebook Insights')
  console.log(facebookInsights)
  try {
    var rows = reportToRows(requestedFields, facebookInsights);
  } catch (e) { console.log(e) }

  result = {
    schema: requestedFields.build(),
    rows: rows
  };

  return result;
}


function reportToRows(requestedFields, report) {
  rows = [];

  for (var i = 0; i < report.length; i++) {
    var row = [];

    var transactions = 0;
    var revenue = 0;

    if ('actions' in report[i]) {
      for (var j = 0; j < report[i]['actions'].length; j++) {
        transactions += report[i]['actions'][j]['value'];
      }
    }

    if ('action_values' in report[i]) {
      for (var j = 0; j < report[i]['action_values'].length; j++) {
        revenue += report[i]['action_values'][j]['value'];
      }
    }

    requestedFields.asArray().forEach(function (field) {
      //these conditionals are because they are exceptions in a way
      if (field.getId() === 'date_start') {
        return row.push(report[i][field.getId()].split('-').join(''))
      }
      if (field.getId() === 'actions') {
        return row.push(transactions)
      }
      if (field.getId() === 'action_values') {
        return row.push(revenue)
      }
      return row.push(report[i][field.getId()])
    });

    rows.push({
      values: row
    });
  }
  console.log("Rows ")
  console.log(rows)

  return rows;
}


function isAdminUser() {
  var email = Session.getEffectiveUser().getEmail();
  if (email == 'himanshunegi378@gmail.com') {
    return true;
  } else {
    return false;
  }
}

/**** BEGIN: OAuth Methods ****/

function getAuthType() {
  var response = {
    type: 'OAUTH2'
  };
  return response;
}

function resetAuth() {
  getOAuthService().reset();
}

function isAuthValid() {
  return getOAuthService().hasAccess();
}

function getOAuthService() {
  return OAuth2.createService('exampleService')
    .setAuthorizationBaseUrl('https://www.facebook.com/dialog/oauth')
    .setTokenUrl('https://graph.facebook.com/v3.1/oauth/access_token')
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCallbackFunction('authCallback')
    .setScope('ads_read', 'ads_management');
};

function authCallback(request) {
  var authorized = getOAuthService().handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  };
};

function get3PAuthorizationUrls() {
  return getOAuthService().getAuthorizationUrl();
}

/**** END: OAuth Methods ****/

/**** BEGIN: Other Methods ****/

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function timePeriodInDays(startDate, endDate) {
  if (startDate > endDate) throw new Error('starting date is greater thand ending date')
  return endDate - startDate
}
