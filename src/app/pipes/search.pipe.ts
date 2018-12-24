import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'search'
})
export class SearchPipe implements PipeTransform {
    transform(data: any, search?: any, propertyName?: string): any {
        if (search === undefined) {
            return data;
        } else {
            return data.filter(obj => obj[propertyName].toLowerCase().includes(search.toLowerCase()));
        }
    }
}