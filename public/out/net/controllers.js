// PUBLIC FUNCTION DEFINITIONS
// test functions:
export async function getNumber() {
    let data = await fetch("http://localhost:2000/test-get");
    data = await data.json();
    return data["number"];
}
