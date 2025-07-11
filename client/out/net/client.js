// PUBLIC FUNCTION DEFINITIONS
// test functions:
export async function getServerNumber() {
    let data = await fetch("http://localhost:2000/test-get");
    data = await data.json();
    return data["number"];
}
export async function putServerNumber(num) {
    let data = await fetch("http://localhost:2000/test-send", {
        method: "PUT",
    });
    data = await data.json();
    return data["number"];
}
