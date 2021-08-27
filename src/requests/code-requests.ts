export const runUserCode = async (code: string) => {
    const url = "/runCode";
    const request = new Request(url, {
        method: "POST",
        headers: {
            Accept: "application/json, text/plain",
            "Content-Type": "application/json",
            "Cache-Control": "private",
        },
        body: JSON.stringify({ text: code }),
    });

    const resultBody = await fetch(request)
        .catch((err) => {
            console.error("Request error while trying to run user code!");
            console.error(err);
        })
        .then(async (res: Response) => {
            return await res.json();
        });

    /*document.getElementById("outputDiv").innerHTML =
        resultBody.output.replace(/\n\r?/g, "<br />") ?? "Code produced no result...";*/
};
