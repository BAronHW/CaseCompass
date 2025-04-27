import { requestTypeEnum } from "../interfacesEnumsAndTypes/enums";

export const customFetch = async (url: string, requestType: requestTypeEnum, accessToken?: string, body?: JSON) => {

    try{

        const serializedRequestType = () : string | Error=> {

            switch(requestType){
                case requestTypeEnum.GET:
                    return 'GET';
    
                case requestTypeEnum.POST:
                    return 'POST';
    
                case requestTypeEnum.DELETE:
                    return 'DELETE';
    
                case requestTypeEnum.PUT:
                    return 'PUT';
    
                default:
                    return new Error('unable to serialize the request type');
            }

        }

        const method = serializedRequestType().toString();

        const headerWithToken = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        }

        const headerNoToken = {
            "Content-Type": "application/json",
        }

        const options : RequestInit = {
            method: method,
            headers: accessToken !== null ? headerWithToken : headerNoToken
        }

        // GET requests cannot have bodies
        if(method !== 'GET' && body){
            options.body = JSON.stringify(body);
        };

        const response = await fetch(url, options);

        if (method !== 'GET' && body) {
            options.body = JSON.stringify(body);
        }

        if(!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }

        const returnJson = await response.json();
        return returnJson;

    }catch(error){
        throw new Error(`Error message ${error}`);
    }

}

export { requestTypeEnum };
