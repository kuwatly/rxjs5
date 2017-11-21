import {Observable} from "rxjs";

let numbers = [1, 2, 5, 10];
let source = Observable.create(observer => {
    let index = 0;
    let produceValue = () => {
        observer.next(numbers[index++]);

        if (index < numbers.length) {
            setTimeout(produceValue, 250);
        } else {
            observer.complete();
        }
    };
    produceValue();
})
    .map(n => n * 2)
    .filter(n => n > 4);

source.subscribe(
    value => console.log(`value: ${value}`),
    e => console.log(`error: ${e}`),
    () => console.log(`complete`)
);

let circle = document.getElementById("circle");
let sourceEvent = Observable.fromEvent(document, "mousemove")
    .map((e : MouseEvent) => {
        return {
            x: e.clientX,
            y: e.clientY
        }
    })
    .filter(value => value.x < 500)
    .delay(300);

function onNext(value) {
    circle.style.left = value.x;
    circle.style.top = value.y;
}
sourceEvent.subscribe(
    onNext,
    e => console.log(`error: ${e}`),
    () => console.log(`complete`)
);

let output = document.getElementById("output");
let button = document.getElementById("button");
let buttonFetch = document.getElementById("buttonFetch");

let clickEvent = Observable.fromEvent(button, "click");
let clickEventFetch = Observable.fromEvent(buttonFetch, "click");

function load(url: string) {
    return Observable.create(observer => {
        let xhr = new XMLHttpRequest();

        let onLoad = () => {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                observer.next(data);
                observer.complete();
            } else {
                observer.error(xhr.statusText);
            }
        };
        xhr.addEventListener("load", onLoad);

        xhr.open("GET", url);
        xhr.send();

        return () => {
            xhr.removeEventListener("load", onLoad);
            xhr.abort();
        }
    }).retryWhen(retryStrategy({attempts: 3, delay: 1500}));
}

function loadWithFetch(url: string) {
    return Observable.defer(() => {
        return Observable.fromPromise(
            fetch(url).then(r => {
                if (r.status === 200) {
                    return r.json();
                } else {
                    return Promise.reject(r);
                }
            }));
    }).retryWhen(retryStrategy());
}

function retryStrategy({attempts = 4, delay = 1000} = {}) {
    return function(errors) {
        return errors
            .scan((acc, value) => {
                acc += 1;
                if (acc < attempts) {
                    return acc;
                } else {
                    throw new Error(value);
                }
            }, 0)
            .delay(delay);
    }
}

function renderMovies(movies) {
    movies.forEach(m => {
        let div = document.createElement("div");
        div.innerText = m.title;
        output.appendChild(div);
    })
}

let subscription = load("movies.json").subscribe(renderMovies);
loadWithFetch("movies.json")
    .subscribe(renderMovies,
        e => console.log(`error: ${e}`),
        () => console.log(`complete!`));
console.log(subscription);
subscription.unsubscribe();

clickEvent.flatMap(e => load("movies.json"))
    .subscribe(
        renderMovies,
        e => console.log(`error: ${e}`),
        () => console.log(`complete`)
    );

clickEventFetch.flatMap(e => loadWithFetch("movies.json"))
    .subscribe(
        renderMovies,
        e => console.log(`error: ${e}`),
        () => console.log(`complete`)
    );