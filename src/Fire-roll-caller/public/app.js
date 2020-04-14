document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app()
    console.log(app)
    if (navigator.geolocation) {
        console.log("support geopoint")
        navigator.geolocation.getCurrentPosition(location => {
            geopoint = { latitude: location.coords.latitude, longitude: location.coords.longitude }
            console.log(geopoint)
        })


    }
})

let geopoint = null


let loginObj = new Vue({
    el: "#loginDiv",
    data: {
        show: true
    },
    methods: {
        login: function() {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider)
                .then(result => {
                    this.show = false
                    const user = result.user
                    helloObj.user = user
                    helloObj.showname()
                    selectclassObj.init_class_list()
                })
        }
    }
})

let helloObj = new Vue({
    el: "#helloDiv",
    data: {
        user: null,
        show: false,
        message: "",
        portal_message: ""
    },
    methods: {
        showname: function() {
            this.message = "Hello ," + this.user.displayName
            this.portal_message = "進入管理員模式"
            this.show = true
        },
        into_admin: function() {
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            let flag = fasle
            db.collection("core").doc("adminauth"), get()
                .then(
                    flag = true
                )
                .catch(err => {
                    console.log(err)
                    alert("你不具有管理員權限")
                })
        }

    }

})

let selectclassObj = new Vue({
    el: "#selectclassDiv",
    data: {
        show: false,
        selected: "",
        options: []
    },
    methods: {
        init_class_list: function() {
            this.show = true
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            const schedule = db.collection("user-data").doc(user.email)
            schedule.onSnapshot(doc => {
                const data = doc.data()
                this.options = data.classes.map(function(element) {
                    return { value: element, text: element }
                })
                try {
                    this.selected = this.options[0].text
                } catch (e) {
                    console.log(e)
                }
                if (selectclassObj.options.length === 0) {
                    this.show = false
                } else {
                    this.show = true
                }
                infoObj.check_if_class_open()
            })
        },
        select_changed: function() {
            infoObj.check_if_class_open()
        }
    }
})

let infoObj = new Vue({
    el: "#infoDiv",
    data: {
        show: false,
        open: false,
        message: "",
        class_attr: "is-info",
        nogeo: true
    },
    methods: {
        check_if_class_open: function() {
            //console.log(class_name)
            this.show = true
            if (selectclassObj.options.length === 0) {
                this.show = false
            }
            if (geopoint) {
                this.nogeo = false
            } else {
                this.nogeo = true
            }
            const class_name = selectclassObj.selected
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            meta = db.collection(class_name).doc("public")
            meta.get()
                .then(
                    doc => {
                        meta.onSnapshot(doc => {
                            const data = doc.data()
                            const is_open = data.open
                            if (is_open === true) {
                                this.message = class_name + "現在開放點名"
                                this.class_attr = "is-info"
                                this.open = true

                            } else if (is_open === false) {
                                this.message = class_name + "現在不開放點名"
                                this.class_attr = "is-warning"
                                this.open = false
                            }
                            formObj.init_form()
                        });
                    },
                    err => {
                        this.message = "出現未知的錯誤"
                        this.class_attr = "is-danger"
                        this.open = false
                        formObj.init_form()
                    }
                )
            formObj.init_form()
        }
    }

})

let formObj = new Vue({
    el: "#formDiv",
    data: {
        show: false,
        not_done: true,
        code: "",
        message: "",
    },
    methods: {
        init_form: function() {
            this.show = infoObj.open
            if (selectclassObj.options.length === 0) {
                this.show = false
            }
            this.not_done = true
            this.message = "提交"
            this.check_done()
        },
        check_done: function() {
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            const class_name = selectclassObj.selected
            this.code = ""
            meta = db.collection(class_name).doc("public")
            meta.get()
                .then(
                    doc => {
                        meta.onSnapshot(doc => {
                            const data = doc.data()
                            const list = data.current
                            if (list.includes(user.email)) {
                                this.not_done = false
                                this.message = "你已完成點名"
                            }
                        })
                    },
                    err => {

                    }
                )
        },
        submit: function() {
            if (this.not_done) {
                const app = firebase.app()
                const db = firebase.firestore()
                const user = firebase.auth().currentUser
                const class_name = selectclassObj.selected
                const code = this.code
                const collection = db.collection("log")
                collection.add({
                    class: class_name,
                    email: user.email,
                    uid: user.uid,
                    code: code,
                    geo: geopoint
                }).then(
                    ref => {
                        formObj.check_done()
                    },
                    err => {

                    }
                )
            }
        }
    }
})