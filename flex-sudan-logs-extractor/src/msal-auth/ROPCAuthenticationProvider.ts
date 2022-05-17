import { AuthenticationProvider } from "@microsoft/microsoft-graph-client";
import Configuration from "../configuration";
import qs from "querystring";
import fetch from "node-fetch";

export default class ROPCAuthenticationProvider implements AuthenticationProvider {
    public async getAccessToken(): Promise<string> {
        const endpoint = `https://login.microsoftonline.com/${Configuration.graph.tenantId}/oauth2/v2.0/token`;
        const requestParams = {
            client_id: Configuration.graph.clientId,
            scope: Configuration.graph.scope,
            username: Configuration.graph.username,
            password: Configuration.graph.password,
            grant_type: "password"
        };

        const authResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: qs.stringify(requestParams)
        });

        if (authResponse.ok) {
            const result = await authResponse.json();
            return result.access_token;
        } else {
            return "";
        }
    }
}
