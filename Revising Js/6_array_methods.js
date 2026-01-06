// Array Methods Classification'
// Array methods are classified into two types
//     1- Mutating (changes original array)
//     2- Non-Mutating (Returns a new array / value)


// 1- Mutating Methods
        // i) push()
            const arrPush = [1, 2];
            arrPush.push(3);
            console.log(`arrPush = ${arrPush}`);
        // ii) .pop()
            const arrPop = [...arrPush];
            arrPop.pop();
            console.log(`arrPop = ${arrPop}`);
        // iii) unshift() — add to start (avoid in performance critical code because it is O(n))
            const arrunshift = [...arrPop];
            arrunshift.unshift(0);
            console.log(`arrunshift = ${arrunshift}`);
        // iv) shift() - Remove from start avoid in performance critical code because it is O(n))
            const arrShift = [...arrunshift];
            arrShift.shift();
            console.log(`arrShift = ${arrShift}`);
        // v) splice() The most powerful but dangerous
            // syntax: arr.splice(startTransition, deleteCount, ...items);

// 2- Non-mutating Methods
        // i) toString()
            const arrayToString = ["Waseem", " Lamiah"];
            console.log(`arrayToString = ${arrayToString.toString()}`);
        // ii) concat()
            const arrayConcat1 = [1,2,3,4,5,6,7,8,9,10];
            const arrayConcat2 = [11,12,13,14,15,16,17,18,19,20];
            arrayConcatenated = arrayConcat1.concat(arrayConcat2);
            console.log(`arrayConcatenated = ${arrayConcatenated}`);

