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
            const arrSplice = [1,2,3,4,5,6];
            arrSplice.splice(2,2, 19,14,14,16)
            console.log(`arrSplice = ${arrSplice}`);
        // vi) sort()
            const arrSort = [11,1,6,1,743,3,66,2];
            arrSort.sort();
            console.log(`arrSort = ${arrSort}`);
        // vii) reverse()
            const arrReverse = [1,2,3,4,5,6];
            arrReverse.reverse();
            console.log(`arrReverse = ${arrReverse}`);
        // viii) fill()
            const arrFill = [1, 2, 3, 4, 5];
            arrFill.fill(0, 1, 4); 
            console.log(`arrFill = ${arrFill}`); // arrFill is now [1, 0, 0, 0, 5] (fills from index 1 up to, but not including, index 4)

// 2- Non-mutating Methods
        // i) toString()
            const arrayToString = ["Waseem", " Lamiah"];
            console.log(`arrayToString = ${arrayToString.toString()}`);
        // ii) concat()
            const arrayConcat1 = [1,2,3,4,5,6,7,8,9,10];
            const arrayConcat2 = [11,12,13,14,15,16,17,18,19,20];
            arrayConcatenated = arrayConcat1.concat(arrayConcat2);
            console.log(`arrayConcatenated = ${arrayConcatenated}`);
        // iii) slice() returns a piece of an array
            const arraySlice = [1,2,3,4,5,6,7,8,9,10];
            const slicedArray = arraySlice.slice(1, -1)
            console.log(`slicedArray = ${slicedArray}`)


