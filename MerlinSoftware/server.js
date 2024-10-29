const http = require('http');

const port = 8080;

const server = http.createServer((req,res)=>{
res.setHeader('Content-Type','application/json')

if (req.method === 'POST' && req.url === '/sort-products'){
    let body = '';

    // Get data
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        handleRequest(body, res);
    });
}

else {
    sendErrorResponse(res, 404, 'The requested resource was not found.');
}
});

const handleRequest = (body, res) => {
    try {
        const {salesWeight, stockWeight, productSales, productStock } = JSON.parse(body);
        
        // Verify that all data exist
        if (!salesWeight || !stockWeight || !productSales || !productStock) {
            res.statusCode = 400;
            sendErrorResponse(res, 400, 'Required data: salesWeight float, stockWeigth float, productSales array, productStock array.');
            return;
        }

        // Dictionary of stocks
        const stocks = {};
        productStock.forEach(({productId, stock}) => {
            stocks[productId] = stock
        });
        
        // Calculate the weighted score
        const products = productSales.map(({productId, sales}) =>{
            const stock = stocks[productId];
            const points = sales * salesWeight + stock * stockWeight;
            return { productId, points, stock, sales };
        });
        
        products.sort((a, b) => b.points - a.points);

        // Save relevant data
        result = products.map(({ productId, stock, sales }) => ({ productId, stock, sales }));

        res.statusCode = 200;
        res.end(JSON.stringify(result));

    } catch (error) {
        sendErrorResponse(res, 400, 'Error while processing data, weights must be numbers, sales and stock arrays.' );
    }
}

const sendErrorResponse = (res, statusCode, message) => {
    res.statusCode = statusCode;
    res.end(JSON.stringify({ error: message }));
};

server.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});