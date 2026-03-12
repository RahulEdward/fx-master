"""
OANDA HTTP Client
Low-level async HTTP client for all OANDA v20 REST API calls.
"""

from typing import Any, Dict, Optional
import httpx
from utils.logger import logger
from config import settings


class OandaClient:
    """
    Async HTTP client wrapper for OANDA v20 REST API.
    Supports both demo and live environments.
    """

    DEMO_URL = settings.OANDA_DEMO_URL
    LIVE_URL = settings.OANDA_LIVE_URL
    STREAM_DEMO_URL = settings.OANDA_STREAM_DEMO_URL
    STREAM_LIVE_URL = settings.OANDA_STREAM_LIVE_URL

    def __init__(self, api_token: str, account_id: str, environment: str = "demo"):
        self.api_token = api_token
        self.account_id = account_id
        self.environment = environment.lower()

        # Select base URLs
        if self.environment == "live":
            self.base_url = self.LIVE_URL
            self.stream_url = self.STREAM_LIVE_URL
        else:
            self.base_url = self.DEMO_URL
            self.stream_url = self.STREAM_DEMO_URL

        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
            "Accept-Datetime-Format": "RFC3339",
        }

        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        """Lazy-init the async HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers=self.headers,
                timeout=httpx.Timeout(30.0),
            )
        return self._client

    async def close(self):
        """Close the underlying HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()

    # ----- Generic request methods -----

    async def _request(
        self,
        method: str,
        path: str,
        params: Optional[Dict[str, Any]] = None,
        json_body: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Execute an authenticated request against OANDA v20 API."""
        client = await self._get_client()
        try:
            response = await client.request(
                method=method,
                url=path,
                params=params,
                json=json_body,
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            error_body = e.response.text
            logger.error(f"OANDA API error {e.response.status_code}: {error_body}")
            raise OandaAPIError(
                status_code=e.response.status_code,
                message=error_body,
            )
        except httpx.RequestError as e:
            logger.error(f"OANDA request failed: {e}")
            raise OandaConnectionError(str(e))

    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return await self._request("GET", path, params=params)

    async def post(self, path: str, json_body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return await self._request("POST", path, json_body=json_body)

    async def put(self, path: str, json_body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return await self._request("PUT", path, json_body=json_body)

    async def patch(self, path: str, json_body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return await self._request("PATCH", path, json_body=json_body)


# ----- Custom Exceptions -----

class OandaAPIError(Exception):
    """Raised when OANDA returns an HTTP error response."""
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"OANDA API Error {status_code}: {message}")


class OandaConnectionError(Exception):
    """Raised when the connection to OANDA fails."""
    pass
