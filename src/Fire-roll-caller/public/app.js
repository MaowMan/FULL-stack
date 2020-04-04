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
                    const user = result.user
                    helloObj.user = user
                    helloObj.showname()
                    this.show = false
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