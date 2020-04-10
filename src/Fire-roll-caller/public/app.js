document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app()
    console.log(app)
})

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
        message: ""
    },
    methods: {
        showname: function() {
            this.message = "Hello ," + this.user.displayName
            this.show = true
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
        class_attr: "is-info"
    },
    methods: {
        check_if_class_open: function() {
            //console.log(class_name)
            this.show = true
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
                        console.log(err)
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
        message: ""
    },
    methods: {
        init_form: function() {
            this.show = infoObj.open
            this.not_done = true
            this.message = "提交"
            this.check_done()
        },
        check_done: function() {
            const app = firebase.app()
            const db = firebase.firestore()
            const user = firebase.auth().currentUser
            const class_name = selectclassObj.selected
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
                        console.log(err)
                    }
                )
        },
        submit: function() {
            if (this.not_done) {
                const app = firebase.app()
                const db = firebase.firestore()
                const user = firebase.auth().currentUser
                const class_name = selectclassObj.selected

            }
        }
    }
})