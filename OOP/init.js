// function Person() {
//     this.attributes = 'homoSapiens'
// }
// Person.prototype.say = function() {
//     console.log(this.attributes)
// }
// let F = new Person()
// F.say()

class Person {
    constructor(name) {
        this.name = name
        this.attributes = 'homoSapiens'
    }

    say() {
        console.log(this.attributes)
    }
}

class F extends Person {}
new F().say()
