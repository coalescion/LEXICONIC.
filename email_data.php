<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $phrase = $_POST['phrase'];
    $description = $_POST['description'];
    $contactInfo = $_POST['contactInfo'];

    $to = "arka2021@mymail.pomona.edu";
    $subject = "New Form Submission";
    $message = "Phrase: $phrase\nDescription: $description\nContact Info: $contactInfo";
    $headers = "From: no-reply@lexiconic.global";

    if (mail($to, $subject, $message, $headers)) {
        echo "success";
    } else {
        echo "error";
    }
} else {
    echo "invalid";
}
?>