import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter"
})
export class FilterPipe  implements PipeTransform {
  transform(array: any, field: string, checkForThisValue: any): any[] {
    if (!Array.isArray(array)) {
      return;
    }
    console.log(array);
    array.filter(e => e[field] === checkForThisValue);
    return array;
  }
}