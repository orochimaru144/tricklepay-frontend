# Mock Development Mode

TricklePay includes a mock API mode that serves fixture data directly from the client. This allows for layout and styling work, as well as testing interface interactions, without needing to run the backend API or a database.

## How to enable

To enable the mock mode, set the `NEXT_PUBLIC_MOCK_API` environment variable to `true` in your `.env` or `.env.local` file:

```
NEXT_PUBLIC_MOCK_API=true
```

## What the fixtures cover

The mock data, defined in `lib/mock-api.ts`, includes five pre-configured streams that represent various states of the application lifecycle:

1. **A mid-flight streaming stream**: Visibly accruing balances over time.
2. **A pending stream**: Scheduled to start in the future.
3. **A completed stream**: Reached the end of its duration and is fully vested.
4. **A cancelled stream**: Terminated early, leaving some funds unvested.
5. **A long-running, large stream**: A stream with a significant balance and duration to test number formatting and long accruals.

These fixtures allow the UI to fully exercise the dashboard view, stream details, and balance calculations seamlessly. The times are generated dynamically relative to when the app loads, ensuring the statuses remain correct no matter when you test.

## Defaults

By default, the mock API mode is **off**. The application will attempt to connect to the backend URL defined by `NEXT_PUBLIC_API_URL` unless the mock variable is explicitly enabled.
