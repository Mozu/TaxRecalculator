/**
 * Implementation for http.commerce.catalog.storefront.tax.estimateTaxes.before
 */

 module.exports = function(context, callback) {
  var request = context.request;
  var response = context.response;
  var taxableOrder = request.body;

  console.log('----- Taxable Order -----');
  console.log(taxableOrder);

  // set default values
  var orderTaxContext = {};
  orderTaxContext.itemTaxContexts = [];
  orderTaxContext.shippingTax = 0;
  orderTaxContext.handlingFeeTax = 0;
  orderTaxContext.orderTax = 0;
  orderTaxContext.taxData = null;

  try {
    var lineItems = taxableOrder.lineItems;
    lineItems.forEach(function (lineItem) {       
    // if item is taxable, procceed else skip
    if(lineItem.isTaxable) {   
        // set default values
        var itemTaxContext = {};
        itemTaxContext.id = lineItem.id;
        itemTaxContext.productCode = lineItem.productCode;
        itemTaxContext.quantity = lineItem.quantity;
        itemTaxContext.tax = 0;
        itemTaxContext.shippingTax = 0;

        // calculate item tax
        if(lineItem.data && lineItem.data.itemTaxRate) {
          var itemTaxRate = parseFloat(lineItem.data.itemTaxRate);
          var itemTotal = parseFloat(lineItem.lineItemPrice);

          var itemTax = calculateTax(itemTotal, itemTaxRate);
          itemTaxContext.tax = smartRound(itemTax, 2);
          orderTaxContext.orderTax += itemTax;
        }

        // calculate shipping tax
        if(lineItem.data && lineItem.data.shippingTaxRate && lineItem.shippingAmount > 0) {
          var shippingTaxRate = parseFloat(lineItem.data.shippingTaxRate);
          var shippingTotal = parseFloat(lineItem.shippingAmount);

          var shippingTax = calculateTax(shippingTotal, shippingTaxRate);
          itemTaxContext.shippingTax = smartRound(shippingTax, 2);
          orderTaxContext.shippingTax += shippingTax;
        }
        itemTaxContext.taxData = null;
        orderTaxContext.itemTaxContexts.push(itemTaxContext);
      }
    });

    orderTaxContext.orderTax = smartRound(orderTaxContext.orderTax, 2);
    orderTaxContext.shippingTax = smartRound(orderTaxContext.shippingTax, 2);
  }
  catch(ex) {
    console.log(ex);
  }
    
  console.log('\n----- Order Tax Context -----');
  console.log(orderTaxContext);
  response.body = orderTaxContext;
  response.end();
  callback();
};

function calculateTax(amount, rate){
  return (amount * rate)/100;
}

function smartRound(amount, decimalPoints){
  return amount.toFixed(decimalPoints);
}