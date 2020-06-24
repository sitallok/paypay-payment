const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const paypal = require("paypal-rest-sdk");

// View engine
app.set('view engine', 'ejs');

//Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Paypal connect
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'ASdLRaKavWMGk3ns4eBx2bZ303DtU6Zy5DTbACfjLwJ5ef2T-smvz68wC9tBeyuToiw19rkpi6OXAZ0i',
    'client_secret': 'EJ_g-3G3E7ac0CdLMpu1kwYfE0ZEHpcYyWAowKJ3VDnqUQ0o0kiir3y5QMnZXnPtLnoSqFG4OGiVs43h'
});

app.get("/", (req, res) => {

    res.render("index");

});

app.post("/comprar", (req, res) => {

    var email = req.body.email;
    var id = req.body.id;



    var pagamento = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": `http://localhost:45567/final?email=${email}&id=${id}`,
            "cancel_url": "http://cancel.url"
        },
        "transactions": [{
            "item_list": {
                "items": [
                    {
                        "name": "Bola",
                        "sku": "bola_303",
                        "price": "5.00",
                        "currency": "BRL",
                        "quantity": 5
                    }
                ]
            },
            "amount": {
                "currency": "BRL",
                "total": "25"
            },
            "description": "Essa é a melhor bola de todas"
        }]
    };

    paypal.payment.create(pagamento, (error, payment) => {

        if(error){
            console.log(error);
        }else{

            for(var i = 0; i < payment.links.length; i++){
                var p = payment.links[i];
                if(p.rel === 'approval_url'){
                    res.redirect(p.href);
                }
            }

        }

    });


});

app.get("/final", (req, res) => {

    var payerId = req.query.PayerID;
    var paymentId = req.query.paymentId;

    var email = req.query.email;
    var id = req.query.id;

    console.log(email);
    console.log(id);

    var final = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "BRL",
                "total": "25"
            }
        }]
    }

    paypal.payment.execute(paymentId, final, (error, payment) => {
        if(error){
            console.log(error);
        }else{
            res.json(payment);
        }
    });

});


app.listen(45567, () => {
    console.log("Running!")
})

