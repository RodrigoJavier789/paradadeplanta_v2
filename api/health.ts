export default function handler(
  request: any,
  response: any,
) {
  response.status(200).json({
    status: 'ok',
    message: 'API is running correctly.',
    timestamp: new Date().toISOString(),
  });
}