<?php
// ডাটাবেসের সাথে কানেক্ট করার জন্য
$conn = mysqli_connect("localhost", "root", "", "simless_db");

// ডাটাবেস থেকে API Key তুলে আনার জন্য
$result = mysqli_query($conn, "SELECT api_key FROM settings WHERE id = 1");
$row = mysqli_fetch_assoc($result);

// ডাটা JSON ফরম্যাটে পাঠানোর জন্য
header('Content-Type: application/json');
echo json_encode($row);
?>