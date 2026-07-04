<?php
$host = "localhost";
$user = "root";
$pass = "";
$db = "simless_db";

// ডাটাবেস কানেকশন
$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("ডাটাবেস কানেকশন ফেল করেছে: " . mysqli_connect_error());
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $apiKey = $_POST['simApiKey'];
    
    // ডাটাবেসে API Key আপডেট করার চেষ্টা
    $sql = "UPDATE settings SET api_key = '$apiKey' WHERE id = 1";
    mysqli_query($conn, $sql);
    
    // যদি settings টেবিল একদম খালি থাকে, তাহলে নতুন করে ইনসার্ট করবে
    if (mysqli_affected_rows($conn) == 0) {
        $insert_sql = "INSERT INTO settings (id, api_key) VALUES (1, '$apiKey')";
        mysqli_query($conn, $insert_sql);
    }
    
    echo "API Key সফলভাবে ডাটাবেসে সেভ হয়েছে! আপনি এখন আগের পেজে ফিরে যেতে পারেন।";
}
?>