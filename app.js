/* app.js */
const opentelemetry = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
// const { trace, diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require("@opentelemetry/tracing");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");


// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
const provider = new BasicTracerProvider({
  resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: "DTR-UI" }),
});

const oltpExporter = new OTLPTraceExporter({
  // optional - url default value is http://localhost:4317/v1/traces
  url: "http://localhost:4318/v1/traces",
  // optional - collection of custom headers to be sent with each request, empty by default
  headers: {},
});

// export spans to console (useful for debugging)
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
// export spans to opentelemetry collector
provider.addSpanProcessor(new SimpleSpanProcessor(oltpExporter));

provider.register();

const sdk = new opentelemetry.NodeSDK({
  // traceExporter: new opentelemetry.tracing.ConsoleSpanExporter(),
  traceExporter: oltpExporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start()
.then(() => {
  console.log("Tracing initialized");
})
.catch((error) => console.log("Error initializing tracing", error));

const express = require("express");
const PORT = process.env.PORT || "8080";
const app = express();

app.get("/", (req, res) => {
  provider.getTracer('debug').startSpan('test manual span').end();
  res.send("Hello World");
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});