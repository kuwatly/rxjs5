import {Observable} from "rxjs";

let numbers = [1, 2, 5, 10];
let source = Observable.from(numbers);

source.subscribe(
    value => console.log(`value: ${value}`),
    e => console.log(`error: ${e}`),
    () => console.log(`complete`)
);