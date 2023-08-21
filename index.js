
// let unirest = require('unirest');
// import unirest from 'unirest'
var unirest = require('unirest');
var fetch = require('node-fetch');
const express = require('express')
const cors = require('cors')


const serverUrl = "https://d5c4-105-163-156-57.ngrok-free.app"

const app = express()

app.use(express.json())
app.use(cors())


app.get("/", (req, res)=> {

    res.json({
        success: true,
    })
})


const getDarajaToken = async ()=> {
  const secret = "0iZbIee5QbS3MTqf";
  const consumer = "q3jAXG12QS9dPe4ZfEF2GEPsKdDb2DFE";
  const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");

  const requuestResult = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      method: "GET",
      headers: {
        authorization: `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )

  const data = await requuestResult.json()
  const token = data?.access_token

  return token
}

app.get("/create-token", async(_req, res)=> {
    
  const token = await getDarajaToken()

  res.json({
      success: true,
      token,
  })
})

app.post("/pay", async(req, res)=> {
    
  const { phone, } = req.body
  const token = await getDarajaToken()


  const url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

  // till no or paybill
  const shortCode = 174379
  const amount = 1
  const passKey = "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjMwODIwMTkwNTAz"

  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
  const password = new Buffer.from(shortCode + passKey + timestamp).toString(
    "base64"
  );

  const data = {
    "BusinessShortCode": shortCode,
    "Password": passKey,
    "Timestamp": "20230820190503",

    // CustomerPayBillOnline for paybill
    // CustomerBuyGoodsOnline for till
    "TransactionType": "CustomerPayBillOnline",
    "Amount": amount,
    "PartyA": phone,
    "PartyB": shortCode,
    "PhoneNumber": phone,
    "CallBackURL": `${serverUrl}/payment-confirmation`,
    "AccountReference": "PayIt LTD",
    "TransactionDesc": "Payment of Items" 
  }

  const requestResult = await fetch(
    url,
    {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Authorization": `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }
  )

  const resultData = await requestResult.json()

  res.json({
      success: true,
      token,
      resultData,
      "CallBackURL": `${serverUrl}/payment-confirmation`,
  })
})



app.post("/payment-confirmation", (req, res)=> {

  console.log('====================================');
  console.log('====================================');
  console.log('====================================');
  console.log("payment-confirmation")
  console.log("req ", req.body);
  console.log('====================================');
  console.log('====================================');
  console.log('====================================');

  res.json({
    success: true,
  })
})


app.post("/payment-cancelled", (req, res)=> {

  console.log('====================================');
  console.log('====================================');
  console.log('====================================');
  console.log("/payment-cancelled ")
  console.log("req ", req.body);
  console.log('====================================');
  console.log('====================================');
  console.log('====================================');

  res.json({
    success: true,
  })
})


// REGISTER URL FOR C2B
// contact support 
// apisupport@safaricom.co.ke
// https://developer.safaricom.co.ke/APIs/CustomerToBusinessRegisterURL not working
// https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl
app.get("/register-urls", async (req, res) => {

  try {
    const token = await getDarajaToken()


    const url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl";
    const auth = "Bearer " + token;


    // Completed | Canceled
    // ResponseType: "Completed",
    const data = {
      "ShortCode": "174379",
      "ResponseType": "Completed",
      "ConfirmationURL": `${serverUrl}/payment-cancelled`,
      "ValidationURL": `${serverUrl}/payment-cancelled`,
    }
  
    const requestResult = await fetch(
      url,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }
    )
  
    const responseData = await requestResult.json()
  
    res.json({
      registered: true,
      responseData,
      token,
    })

  } catch (error) {

    console.log('====================================');
    console.log("error ", error);
    console.log('====================================');
    
    res.json({
      registered: false,
      error,
    })
  }
})




app.listen(4444, () => {
    console.log(`Server started on port ${4444}`);
})


// let req = unirest('POST', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
// .headers({
//     'Content-Type': 'application/json',
//     'Authorization': 'Bearer FZAsl9bJU4voPgRWzlYlyyJXK251'
// })
// .send(JSON.stringify({
    // "BusinessShortCode": 174379,
    // "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjMwODIwMTkwNTAz",
    // "Timestamp": "20230820190503",
    // "TransactionType": "CustomerPayBillOnline",
    // "Amount": 1,
    // "PartyA": 254799919960,
    // "PartyB": 174379,
    // "PhoneNumber": 254799919960,
    // "CallBackURL": "https://mydomain.com/path",
    // "AccountReference": "CompanyXLTD",
    // "TransactionDesc": "Payment of X" 
//   }))
// .end(res => {
//     if (res.error) {

//         // throw new Error(res.error);
//         console.log('====================================');
//         console.log("got an error ", res.error);
//         console.log('====================================');
//     }
//     console.log(res.raw_body);
// });