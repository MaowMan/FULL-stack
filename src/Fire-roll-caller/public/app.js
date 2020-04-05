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
            const schedule = db.collection("private").doc(user.email)
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

            })
        }
    }
})