import {Observable} from "rxjs";

let numbers = [1, 2, 5, 10];
let source = Observable.create(observer => {
    for (let n of numbers) {
        if (n === 5) {
            observer.error("Something went wrong");
        }
        observer.next(n);
    }
    observer.complete();
});

source.subscribe(
    value => console.log(`value: ${value}`),
    e => console.log(`error: ${e}`),
    () => console.log(`complete`)
);