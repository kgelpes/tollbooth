import {
	metadataCorsOptionsRequestHandler,
	protectedResourceHandler,
} from "mcp-handler";

const handler = protectedResourceHandler({
	authServerUrls: ["https://example-authorization-server-issuer.com"],
});

export { handler as GET, metadataCorsOptionsRequestHandler as OPTIONS };
