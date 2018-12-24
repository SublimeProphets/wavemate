import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "sort"
})
export class ArraySortPipe  implements PipeTransform {
  transform(array: any, field: string, direction: "asc"|"desc"): any[] {
    if (!Array.isArray(array)) {
      return;
    }
    console.log(array);
    array.sort((a: any, b: any) => {
      console.log(a[field] < b[field], a[field] > b[field])
        if (a[field] < b[field]) {
        return (direction === "asc") ? -1 : 1;
      } else if (a[field] > b[field]) {
        return (direction === "asc") ? 1 : -1;
      } else {
        return 0;
      }
    });
    return array;
  }
}