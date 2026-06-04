exports.handler = async function () {
  const cronSecret = process.env.CRON_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || process.env.DEPLOY_PRIME_URL;

  if (!cronSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "CRON_SECRET is not configured" })
    };
  }

  if (!siteUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Site URL is not configured" })
    };
  }

  const response = await fetch(`${siteUrl.replace(/\/$/, "")}/api/reminders/rsvp`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cronSecret}`
    }
  });

  const body = await response.text();

  return {
    statusCode: response.status,
    body
  };
};
