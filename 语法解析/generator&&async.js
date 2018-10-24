const Iterator = arr => {
    let nextIndex = 0
    return {
        next: function() {
            return nextIndex < arr.length
                ? { value: arr[nextIndex++] }
                : { done: true }
        }
    }
}
const demo = Iterator([1, 2, 3])
demo.next()

function* main() {
    var result = yield request('http://some.url')
    var resp = JSON.parse(result)
    console.log(resp.value)
}

function request(url) {
    makeAjaxCall(url, function(response) {
        it.next(response)
    })
}

var it = main()
it.next()
