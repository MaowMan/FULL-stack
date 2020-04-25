const functions = require('firebase-functions')
const geolib = require('geolib')
const admin = require("firebase-admin")

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


admin.initializeApp(functions.config().firebase)

exports.log_incoming = functions.firestore.document("/log/{doc}").onCreate(event => {
    const doc_id = event.id
    const data = event.data()
        //console.log(data)
    const class_name = data.class
    const email = data.email
    const uid = data.uid
    const code = data.code
    const geopoint = data.geo
    let sheet_data = null
    admin.firestore().collection(class_name).doc("private").get()
        .then(doc => {
            sheet_data = doc.data()
                //console.log(sheet_data)
            let flag = true
            if (sheet_data.students.indexOf(uid) === -1) {
                flag = false
            }
            if (code !== sheet_data.code && sheet_data.code_strict === true) {
                flag = false
            }
            if (sheet_data.geo_strict === true) {
                if (geopoint === null || geolib.getDistance(geopoint, sheet_data.geo) > sheet_data.geo_dist) {
                    flag = false
                }
            }
            if (flag === true) {
                admin.firestore().collection(class_name).doc("public").update({
                        current: admin.firestore.FieldValue.arrayUnion(email)
                    })
                    //console.log("success")
                admin.firestore().collection("log").doc(doc_id).update({ status: true })
            } else {
                //console.log("failed")
                admin.firestore().collection("log").doc(doc_id).update({ status: false })
            }
            return 0
        })
        .catch(err => {
            console.log(err)
        })
    return 0
})

exports.new_user = functions.auth.user().onCreate(user => {
    admin.firestore().collection("core").doc("meta").update({
        users: admin.firestore.FieldValue.arrayUnion(user.email)
    })
    admin.firestore().collection("user-data").doc(user.email).create({
        classes: [],
        own: [],
        uid: user.uid
    })
    return 0
})

exports.new_class = functions.firestore.document("req/{doc}").onCreate(event => {

})